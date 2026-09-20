"""
Training Pipeline & Model Candidate Definitions for X-PISA Experiment
Executes end-to-end model training, validation, comparison, selection,
and test-set evaluation under strict time-series isolation.
"""

from typing import Dict, Any, Tuple
import os
import json
import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
import joblib

from .data_loader import load_asset_csv
from .features import compute_features, compute_target, FEATURE_COLUMNS, TARGET_COLUMN, TARGET_NAMES
from .preprocessing import clean_dataset, chronological_split, scale_features
from .evaluate import (
    evaluate_predictions,
    compute_model_probabilities,
    compute_permutation_importance,
    compute_shap_explanations,
    HAS_SHAP,
)


def get_model_candidates(random_state: int = 42) -> Dict[str, Any]:
    """
    Returns the dictionary of candidate models defined for the X-PISA experiment:
    
    1. 'naive_baseline': DummyClassifier (Majority Class) - Statistical lower bound.
    2. 'linear_baseline': LogisticRegression (Multinomial L-BFGS, L2 regularized).
    3. 'primary_random_forest': RandomForestClassifier - Primary interpretable ensemble.
    4. 'primary_gradient_boosting': HistGradientBoostingClassifier - Boosted ensemble.
    """
    candidates = {
        "naive_baseline": DummyClassifier(
            strategy="most_frequent"
        ),
        "linear_baseline": LogisticRegression(
            solver="lbfgs",
            max_iter=1000,
            C=1.0,
            random_state=random_state,
        ),
        "primary_random_forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            min_samples_leaf=15,
            class_weight="balanced",
            random_state=random_state,
            n_jobs=-1,
        ),
        "primary_gradient_boosting": HistGradientBoostingClassifier(
            max_iter=100,
            max_depth=4,
            min_samples_leaf=20,
            class_weight="balanced",
            random_state=random_state,
        ),
    }
    return candidates


def prepare_datasets(
    data_path: str, purge_window: int = 21
) -> Tuple[pd.DataFrame, Dict[str, pd.DataFrame], Dict[str, pd.DataFrame], Any]:
    """
    Loads raw market data, computes causal features and forward target,
    applies time-series cleaning, and executes chronological splitting with embargo purge.
    """
    df_raw = load_asset_csv(data_path)
    df_feat = compute_features(df_raw)
    df_target = compute_target(df_feat, horizon=21)
    df_clean = clean_dataset(df_target)

    splits = chronological_split(df_clean, purge_window=purge_window)
    scaled_splits, scaler = scale_features(splits)

    return df_clean, splits, scaled_splits, scaler


def train_models(
    candidates: Dict[str, Any], X_train: pd.DataFrame, y_train: pd.Series
) -> Dict[str, Any]:
    """
    Trains all candidate models strictly on the training partition.
    """
    trained = {}
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        trained[name] = model
    return trained


def evaluate_models(
    models: Dict[str, Any], X: pd.DataFrame, y: pd.Series
) -> Dict[str, Dict[str, Any]]:
    """
    Evaluates each model on the provided partition (validation or test).
    """
    results = {}
    for name, model in models.items():
        preds = model.predict(X)
        metrics = evaluate_predictions(y.values, preds)
        results[name] = metrics
    return results


def compare_models(
    val_results: Dict[str, Dict[str, Any]], test_results: Dict[str, Dict[str, Any]]
) -> Tuple[pd.DataFrame, str]:
    """
    Compares candidate models using validation set metrics based on the predefined priority:
      1. Macro F1
      2. Tier 0 Recall (Negative market regime detection)
      3. Tier 2 Precision (Positive market regime signal purity)
      4. Accuracy
      
    Returns the comparison DataFrame and the name of the selected model.
    """
    rows = []
    for name in val_results.keys():
        v = val_results[name]
        t = test_results[name]
        rows.append({
            "model": name,
            "validation_accuracy": round(v["accuracy"], 4),
            "validation_macro_f1": round(v["macro_f1"], 4),
            "validation_tier0_recall": round(v["tier0_recall"], 4),
            "validation_tier2_precision": round(v["tier2_precision"], 4),
            "test_accuracy": round(t["accuracy"], 4),
            "test_macro_f1": round(t["macro_f1"], 4),
            "test_tier0_recall": round(t["tier0_recall"], 4),
            "test_tier2_precision": round(t["tier2_precision"], 4),
        })

    df_comp = pd.DataFrame(rows)

    # Sort validation performance by priority: Macro F1 -> Tier 0 Recall -> Tier 2 Precision -> Accuracy
    df_sorted = df_comp.sort_values(
        by=[
            "validation_macro_f1",
            "validation_tier0_recall",
            "validation_tier2_precision",
            "validation_accuracy",
        ],
        ascending=[False, False, False, False],
    ).reset_index(drop=True)

    selected_model_name = df_sorted.iloc[0]["model"]
    return df_comp, selected_model_name


def generate_feature_importance(
    model: Any, model_name: str, feature_names: list
) -> pd.DataFrame:
    """
    Computes feature importance for the selected model.
    For tree models: MDI feature_importances_.
    For linear models: mean absolute coefficient magnitude across classes.
    """
    if hasattr(model, "feature_importances_"):
        raw_imp = model.feature_importances_
    elif hasattr(model, "coef_"):
        raw_imp = np.mean(np.abs(model.coef_), axis=0)
    else:
        raw_imp = np.ones(len(feature_names)) / len(feature_names)

    norm_imp = raw_imp / np.sum(raw_imp) if np.sum(raw_imp) > 0 else raw_imp

    df_imp = pd.DataFrame({
        "Feature": feature_names,
        "Importance": raw_imp,
        "Normalized_Importance": norm_imp,
    }).sort_values(by="Importance", ascending=False).reset_index(drop=True)

    return df_imp


def run_pipeline(
    data_path: str = "ml/data/raw/nifty50_daily_2015_2024.csv",
    models_dir: str = "ml/models",
    reports_dir: str = "ml/reports",
) -> Dict[str, Any]:
    """
    Executes the complete Task 10 training, evaluation, selection, and reporting workflow.
    """
    print("==================================================")
    print("X-PISA TASK 10: MODEL TRAINING & EVALUATION PIPELINE")
    print("==================================================")

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    # 1. Dataset Preparation & Chronological Splitting with Embargo
    print("\n[1/7] Preparing dataset and executing chronological split with 21-day embargo...")
    df_clean, splits, scaled_splits, scaler = prepare_datasets(data_path, purge_window=21)

    print(f"  Train samples: {len(splits['train'])} ({splits['train']['Date'].min().strftime('%Y-%m-%d')} to {splits['train']['Date'].max().strftime('%Y-%m-%d')})")
    print(f"  Validation samples: {len(splits['val'])} ({splits['val']['Date'].min().strftime('%Y-%m-%d')} to {splits['val']['Date'].max().strftime('%Y-%m-%d')})")
    print(f"  Test samples: {len(splits['test'])} ({splits['test']['Date'].min().strftime('%Y-%m-%d')} to {splits['test']['Date'].max().strftime('%Y-%m-%d')})")

    X_train = scaled_splits["train"][FEATURE_COLUMNS]
    y_train = scaled_splits["train"][TARGET_COLUMN]
    X_val = scaled_splits["val"][FEATURE_COLUMNS]
    y_val = scaled_splits["val"][TARGET_COLUMN]
    X_test = scaled_splits["test"][FEATURE_COLUMNS]
    y_test = scaled_splits["test"][TARGET_COLUMN]

    # 2. Train Models Strictly on Train Set
    print("\n[2/7] Instantiating and training 4 candidate models strictly on Train partition...")
    candidates = get_model_candidates(random_state=42)
    trained_models = train_models(candidates, X_train, y_train)

    # 3. Evaluate on Validation Set (for Selection)
    print("\n[3/7] Evaluating candidate models on Validation partition (2022)...")
    val_results = evaluate_models(trained_models, X_val, y_val)
    for name, res in val_results.items():
        print(f"  {name:25s} | Acc: {res['accuracy']:.4f} | Macro-F1: {res['macro_f1']:.4f} | Tier0 Recall: {res['tier0_recall']:.4f} | Tier2 Prec: {res['tier2_precision']:.4f}")

    # 4. Final Evaluation on Untouched Test Set (2023-2024)
    print("\n[4/7] Performing unbiased final evaluation on untouched Test partition (2023-2024)...")
    test_results = evaluate_models(trained_models, X_test, y_test)
    for name, res in test_results.items():
        print(f"  {name:25s} | Acc: {res['accuracy']:.4f} | Macro-F1: {res['macro_f1']:.4f} | Tier0 Recall: {res['tier0_recall']:.4f} | Tier2 Prec: {res['tier2_precision']:.4f}")

    # 5. Validation-Based Model Comparison & Selection
    print("\n[5/7] Comparing models and executing validation-based selection...")
    comp_df, selected_name = compare_models(val_results, test_results)
    print(f"  --> Selected Model based on validation criteria: {selected_name}")

    selected_model = trained_models[selected_name]

    # 6. Interpretability & Feature Importances
    print("\n[6/7] Computing Feature Importance, Permutation Importance, and SHAP...")
    # Model feature importance
    feat_imp_df = generate_feature_importance(selected_model, selected_name, FEATURE_COLUMNS)
    feat_imp_df.to_csv(os.path.join(reports_dir, "feature_importance.csv"), index=False)

    # Also generate tree-based feature importance for Random Forest for direct reference
    rf_model = trained_models.get("primary_random_forest")
    if rf_model:
        rf_imp = generate_feature_importance(rf_model, "primary_random_forest", FEATURE_COLUMNS)
        rf_imp.to_csv(os.path.join(reports_dir, "tree_feature_importance.csv"), index=False)

    # Permutation importance on validation partition
    perm_imp_df = compute_permutation_importance(
        selected_model, X_val, y_val, FEATURE_COLUMNS, n_repeats=10, random_state=42
    )
    perm_imp_df.to_csv(os.path.join(reports_dir, "permutation_importance.csv"), index=False)

    # SHAP explainability
    shap_imp_df = None
    if HAS_SHAP:
        try:
            print("  Generating SHAP global and local explanations...")
            shap_imp_df, shap_vals = compute_shap_explanations(
                selected_model, X_train, X_val, FEATURE_COLUMNS, n_samples=100
            )
            shap_imp_df.to_csv(os.path.join(reports_dir, "shap_feature_importance.csv"), index=False)
            print("  SHAP explanations generated and saved.")
        except Exception as e:
            print(f"  Warning: SHAP explanation encountered exception: {e}")

    # 7. Predictions & Artifact Persistence
    print("\n[7/7] Persisting artifacts, test predictions, and metadata...")
    comp_df.to_csv(os.path.join(reports_dir, "model_comparison.csv"), index=False)

    # Generate Test set predictions and probabilities
    test_preds = selected_model.predict(X_test)
    test_probs = compute_model_probabilities(selected_model, X_test)

    test_pred_df = pd.DataFrame({
        "date": splits["test"]["Date"].dt.strftime("%Y-%m-%d"),
        "actual_regime": y_test.values,
        "predicted_regime": test_preds,
        "probability_tier_0": np.round(test_probs[:, 0], 4),
        "probability_tier_1": np.round(test_probs[:, 1], 4),
        "probability_tier_2": np.round(test_probs[:, 2], 4),
    })
    test_pred_df.to_csv(os.path.join(reports_dir, "test_predictions.csv"), index=False)

    # Save artifacts via joblib
    joblib.dump(selected_model, os.path.join(models_dir, "selected_model.joblib"))
    joblib.dump(scaler, os.path.join(models_dir, "scaler.joblib"))

    # Also save Random Forest and HistGradientBoosting for inspection and hybrid testing
    joblib.dump(trained_models["primary_random_forest"], os.path.join(models_dir, "random_forest.joblib"))
    joblib.dump(trained_models["primary_gradient_boosting"], os.path.join(models_dir, "hist_gradient_boosting.joblib"))
    joblib.dump(trained_models["linear_baseline"], os.path.join(models_dir, "logistic_regression.joblib"))

    # Metadata
    metadata = {
        "selected_model_name": selected_name,
        "model_type": type(selected_model).__name__,
        "hyperparameters": selected_model.get_params(),
        "feature_names": FEATURE_COLUMNS,
        "target_definition": "21-day forward return discretized into 3 regimes (< -2%, [-2%, +3%], > +3%)",
        "class_definitions": TARGET_NAMES,
        "train_period": f"{splits['train']['Date'].min().strftime('%Y-%m-%d')} to {splits['train']['Date'].max().strftime('%Y-%m-%d')}",
        "validation_period": f"{splits['val']['Date'].min().strftime('%Y-%m-%d')} to {splits['val']['Date'].max().strftime('%Y-%m-%d')}",
        "test_period": f"{splits['test']['Date'].min().strftime('%Y-%m-%d')} to {splits['test']['Date'].max().strftime('%Y-%m-%d')}",
        "random_seed": 42,
        "validation_metrics": val_results[selected_name],
        "test_metrics": test_results[selected_name],
    }

    with open(os.path.join(models_dir, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print("\n==================================================")
    print("TASK 10 TRAINING PIPELINE COMPLETE")
    print(f"Selected Model: {selected_name}")
    print(f"Artifacts saved in: {models_dir}")
    print(f"Reports saved in: {reports_dir}")
    print("==================================================")

    return {
        "comparison": comp_df,
        "selected_model_name": selected_name,
        "val_results": val_results,
        "test_results": test_results,
    }


if __name__ == "__main__":
    run_pipeline()
