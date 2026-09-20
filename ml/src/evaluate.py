"""
Evaluation Module for X-PISA Experiment
Calculates classification metrics, class-specific recall for risk management,
confusion matrix breakdowns, permutation importance, and SHAP explainability.
"""

from typing import Dict, Any, Tuple, Optional
import os
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    confusion_matrix,
    classification_report,
)
from sklearn.inspection import permutation_importance
import joblib

try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

from .features import TARGET_NAMES, FEATURE_COLUMNS


def evaluate_predictions(
    y_true: np.ndarray, y_pred: np.ndarray
) -> Dict[str, Any]:
    """
    Computes evaluation metrics for multi-class regime classification.
    
    Priority Metrics:
      1. Macro F1: Primary optimization objective to evaluate balanced performance across all 3 classes.
      2. Tier 0 Recall: Measures detection rate of negative market regimes (< -2%).
      3. Tier 2 Precision: Measures purity/reliability of positive market regimes (> +3%).
      4. Accuracy: Overall fraction of correct classifications.
    """
    acc = accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    weighted_f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

    precisions = precision_score(y_true, y_pred, labels=[0, 1, 2], average=None, zero_division=0)
    recalls = recall_score(y_true, y_pred, labels=[0, 1, 2], average=None, zero_division=0)
    f1s = f1_score(y_true, y_pred, labels=[0, 1, 2], average=None, zero_division=0)

    # Class support counts
    classes, counts = np.unique(y_true, return_counts=True)
    support_dict = {c: int(counts[i]) for i, c in enumerate(classes)}

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1, 2])
    report_str = classification_report(
        y_true,
        y_pred,
        labels=[0, 1, 2],
        target_names=[TARGET_NAMES[i] for i in [0, 1, 2]],
        zero_division=0,
    )

    per_class_metrics = {}
    for i in [0, 1, 2]:
        name = TARGET_NAMES[i]
        per_class_metrics[name] = {
            "precision": float(precisions[i]),
            "recall": float(recalls[i]),
            "f1_score": float(f1s[i]),
            "support": support_dict.get(i, 0),
        }

    return {
        "accuracy": float(acc),
        "macro_f1": float(macro_f1),
        "weighted_f1": float(weighted_f1),
        "tier0_recall": float(recalls[0]),
        "tier2_precision": float(precisions[2]),
        "per_class": per_class_metrics,
        # Backward compatibility with Task 9 verification suite
        "drawdown_detection_recall (Tier 0)": float(recalls[0]),
        "favorable_momentum_precision (Tier 2)": float(precisions[2]),
        "confusion_matrix": cm.tolist(),
        "classification_report": report_str,
    }


def compute_model_probabilities(model: Any, X: pd.DataFrame) -> np.ndarray:
    """
    Computes class prediction probabilities of shape (N, 3).
    Handles models with predict_proba or falls back appropriately.
    """
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)
        # Ensure 3 columns corresponding to classes [0, 1, 2]
        if probs.shape[1] == 3:
            return probs
        elif hasattr(model, "classes_"):
            full_probs = np.zeros((len(X), 3))
            for idx, c in enumerate(model.classes_):
                if c in [0, 1, 2]:
                    full_probs[:, c] = probs[:, idx]
            return full_probs
    # Fallback for models without predict_proba (e.g. constant dummy)
    preds = model.predict(X)
    fallback = np.zeros((len(X), 3))
    for i, p in enumerate(preds):
        fallback[i, int(p)] = 1.0
    return fallback


def compute_permutation_importance(
    model: Any,
    X_eval: pd.DataFrame,
    y_eval: pd.Series,
    feature_names: Optional[list] = None,
    n_repeats: int = 10,
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Calculates model-agnostic permutation importance on validation or test partition.
    Scored using macro-F1 to reflect balanced multi-class performance.
    """
    if feature_names is None:
        feature_names = FEATURE_COLUMNS

    r = permutation_importance(
        model,
        X_eval,
        y_eval,
        n_repeats=n_repeats,
        random_state=random_state,
        scoring="f1_macro",
        n_jobs=-1,
    )

    df_perm = pd.DataFrame({
        "feature": feature_names,
        "mean_importance": r.importances_mean,
        "std_importance": r.importances_std,
    }).sort_values(by="mean_importance", ascending=False).reset_index(drop=True)

    return df_perm


def compute_shap_explanations(
    model: Any,
    X_train: pd.DataFrame,
    X_eval: pd.DataFrame,
    feature_names: Optional[list] = None,
    n_samples: int = 100,
) -> Tuple[pd.DataFrame, Any]:
    """
    Calculates SHAP values for global feature attribution and local explanations.
    Uses TreeExplainer for tree-based models and LinearExplainer for linear models.
    """
    if not HAS_SHAP:
        raise ImportError("SHAP package is not installed.")

    if feature_names is None:
        feature_names = FEATURE_COLUMNS

    eval_sample = X_eval.iloc[:n_samples] if len(X_eval) > n_samples else X_eval

    # Determine appropriate explainer
    model_type = type(model).__name__
    if "RandomForest" in model_type or "HistGradient" in model_type or "Tree" in model_type:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer(eval_sample)
    elif "LogisticRegression" in model_type:
        explainer = shap.LinearExplainer(model, X_train)
        shap_values = explainer(eval_sample)
    else:
        explainer = shap.Explainer(model, X_train)
        shap_values = explainer(eval_sample)

    # Compute global mean absolute SHAP values across all classes and samples
    # shap_values.values has shape (N_samples, N_features, N_classes) or (N_samples, N_features)
    raw_values = shap_values.values
    if len(raw_values.shape) == 3:
        # Average absolute SHAP across samples and classes
        global_importance = np.abs(raw_values).mean(axis=(0, 2))
    else:
        global_importance = np.abs(raw_values).mean(axis=0)

    df_shap = pd.DataFrame({
        "feature": feature_names,
        "mean_abs_shap": global_importance,
    }).sort_values(by="mean_abs_shap", ascending=False).reset_index(drop=True)

    return df_shap, shap_values


def load_artifacts(
    model_path: str, scaler_path: Optional[str] = None
) -> Tuple[Any, Optional[Any]]:
    """
    Loads saved model artifact and scaler object from disk.
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model artifact not found at {model_path}")
    model = joblib.load(model_path)

    scaler = None
    if scaler_path and os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)

    return model, scaler
