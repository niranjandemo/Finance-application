"""
Inference & Prediction Module for X-PISA Experiment
Provides production-safe inference functions, validating feature schemas,
applying the fitted training scaler, and generating class probabilities.
"""

from typing import Dict, Any, List, Optional
import os
import sys
import json
import numpy as np
import pandas as pd
import joblib

from .features import FEATURE_COLUMNS, TARGET_NAMES
from .data_loader import load_asset_csv
from .features import compute_features

DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "selected_model.joblib")
DEFAULT_SCALER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "scaler.joblib")
DEFAULT_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw", "nifty50_daily_2015_2024.csv")


def load_artifacts(
    model_path: Optional[str] = None, scaler_path: Optional[str] = None
) -> tuple:
    """
    Loads serialized model and scaler artifacts.
    """
    m_path = model_path or DEFAULT_MODEL_PATH
    s_path = scaler_path or DEFAULT_SCALER_PATH

    if not os.path.exists(m_path):
        raise FileNotFoundError(f"Model artifact not found at: {m_path}")
    if not os.path.exists(s_path):
        raise FileNotFoundError(f"Scaler artifact not found at: {s_path}")

    model = joblib.load(m_path)
    scaler = joblib.load(s_path)
    return model, scaler


def predict_from_features(
    features: Dict[str, float],
    model: Optional[Any] = None,
    scaler: Optional[Any] = None,
    model_path: Optional[str] = None,
    scaler_path: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Executes production inference for a single input feature dictionary.
    Validates all 10 features, transforms with scaler, and returns structured probabilities.
    """
    if model is None or scaler is None:
        model, scaler = load_artifacts(model_path=model_path, scaler_path=scaler_path)

    # Validate feature completeness
    missing = [col for col in FEATURE_COLUMNS if col not in features]
    if missing:
        raise ValueError(f"Missing required feature columns: {missing}")

    # Create 1-row DataFrame preserving strict training column order
    df_row = pd.DataFrame([{col: float(features[col]) for col in FEATURE_COLUMNS}])

    # Transform using training scaler
    X_scaled_arr = scaler.transform(df_row)
    X_scaled = pd.DataFrame(X_scaled_arr, columns=FEATURE_COLUMNS)

    # Predict discrete regime
    predicted_regime = int(model.predict(X_scaled)[0])

    # Predict class probabilities
    probabilities = {}
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_scaled)[0]
        probabilities = {
            "tier_0": float(round(probs[0], 4)),
            "tier_1": float(round(probs[1], 4)),
            "tier_2": float(round(probs[2], 4)),
        }
    else:
        probabilities = {
            f"tier_{i}": 1.0 if i == predicted_regime else 0.0 for i in [0, 1, 2]
        }

    return {
        "predicted_regime": predicted_regime,
        "regime_name": TARGET_NAMES.get(predicted_regime, "Unknown"),
        "probabilities": probabilities,
        "model": getattr(model, "__class__", type(model)).__name__,
        "is_live": False,
    }


def predict_latest_benchmark(
    data_path: Optional[str] = None,
    model_path: Optional[str] = None,
    scaler_path: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Loads latest verified historical NIFTY 50 benchmark data,
    computes causal features up to the latest session, and returns the model prediction.
    """
    csv_path = data_path or DEFAULT_DATA_PATH
    df_raw = load_asset_csv(csv_path)
    df_feat = compute_features(df_raw)

    latest_row = df_feat.iloc[-1]
    feature_dict = {col: float(latest_row[col]) for col in FEATURE_COLUMNS}

    res = predict_from_features(feature_dict, model_path=model_path, scaler_path=scaler_path)
    res["data_source"] = "Historical NIFTY 50 Benchmark Dataset (2015-2024)"
    res["benchmark_date"] = latest_row["Date"].strftime("%Y-%m-%d")
    res["feature_values"] = feature_dict
    return res


def predict_regime(
    model: Any, features_df: pd.DataFrame
) -> List[Dict[str, Any]]:
    """
    Backward-compatible batch inference function for Task 9 verification suite.
    """
    X = features_df[FEATURE_COLUMNS].values
    preds = model.predict(X)

    probs = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)

    results = []
    for idx, pred in enumerate(preds):
        regime_id = int(pred)
        item = {
            "predicted_tier": regime_id,
            "regime_name": TARGET_NAMES.get(regime_id, "Unknown"),
        }
        if probs is not None:
            item["probabilities"] = {
                TARGET_NAMES[c]: float(probs[idx][c])
                for c in range(len(probs[idx]))
            }
        results.append(item)

    return results


def main():
    """
    CLI handler for command-line execution / Node subprocess invocation.
    """
    if len(sys.argv) > 1 and sys.argv[1] == "--features":
        features_json = sys.argv[2]
        features = json.loads(features_json)
        result = predict_from_features(features)
        print(json.dumps(result))
    else:
        # Default: latest benchmark prediction
        result = predict_latest_benchmark()
        print(json.dumps(result))


if __name__ == "__main__":
    main()
