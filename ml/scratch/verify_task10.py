"""
Task 10 Verification Script
Verifies:
1. Dataset loads successfully.
2. Features are generated properly.
3. Target is generated properly.
4. No missing feature values remain after preprocessing.
5. Chronological split is strictly preserved.
6. No forbidden random split is used.
7. Scaler is fit only on training data.
8. All four models train successfully.
9. Validation metrics are generated.
10. Test metrics are generated.
11. Confusion matrices are generated.
12. Probability predictions are generated.
13. Model comparison CSV exists.
14. Selected model artifact exists.
15. Scaler artifact exists.
16. Feature importance report exists.
17. SHAP report exists.
18. Experiment report exists.
19. Test prediction file exists.
20. Existing Task 9 verification still passes.
"""

import os
import sys
import subprocess
import json
import pandas as pd
import numpy as np

# Ensure workspace and ml directories are on sys.path
WORKSPACE_DIR = r"c:\Users\palan\Documents\Final Proj"
ML_DIR = os.path.join(WORKSPACE_DIR, "ml")
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)
if WORKSPACE_DIR not in sys.path:
    sys.path.insert(0, WORKSPACE_DIR)

from src.data_loader import load_asset_csv
from src.features import compute_features, compute_target, FEATURE_COLUMNS, TARGET_COLUMN
from src.preprocessing import clean_dataset, chronological_split, scale_features
from src.train import get_model_candidates
from src.evaluate import evaluate_predictions, compute_model_probabilities, load_artifacts


def run_task10_verification():
    print("==================================================")
    print("STARTING TASK 10 ML MODEL VERIFICATION")
    print("==================================================")

    passed = 0
    failed = 0

    def assert_check(condition, message):
        nonlocal passed, failed
        if condition:
            print(f"[PASS] {message}")
            passed += 1
        else:
            print(f"[FAIL] {message}")
            failed += 1

    # 1. Dataset loads
    raw_path = os.path.join(ML_DIR, "data", "raw", "nifty50_daily_2015_2024.csv")
    assert_check(os.path.exists(raw_path), f"Dataset file exists at {raw_path}")
    df_raw = load_asset_csv(raw_path)
    assert_check(len(df_raw) > 2000, f"Dataset loaded successfully with {len(df_raw)} records")

    # 2. Features generated
    df_feat = compute_features(df_raw)
    assert_check(all(col in df_feat.columns for col in FEATURE_COLUMNS), f"All {len(FEATURE_COLUMNS)} causal features generated")

    # 3. Target generated
    df_target = compute_target(df_feat, horizon=21)
    assert_check("target_regime" in df_target.columns and "forward_return_21d" in df_target.columns, "Target regime and forward return generated")

    # 4. No missing feature values remain after preprocessing
    df_clean = clean_dataset(df_target)
    null_counts = df_clean[FEATURE_COLUMNS + [TARGET_COLUMN]].isnull().sum().sum()
    assert_check(null_counts == 0, f"Clean dataset contains 0 missing values (found {null_counts})")

    # 5. Chronological split is correct
    splits = chronological_split(df_clean, purge_window=21)
    train_df = splits["train"]
    val_df = splits["val"]
    test_df = splits["test"]
    assert_check(train_df["Date"].max() < val_df["Date"].min(), "Train strictly precedes Validation")
    assert_check(val_df["Date"].max() < test_df["Date"].min(), "Validation strictly precedes Test")

    # 6. No forbidden random split is used
    assert_check(train_df["Date"].is_monotonic_increasing, "Train partition is chronologically ordered")
    assert_check(val_df["Date"].is_monotonic_increasing, "Validation partition is chronologically ordered")
    assert_check(test_df["Date"].is_monotonic_increasing, "Test partition is chronologically ordered")

    # 7. Scaler is fit only on training data
    scaled_splits, scaler = scale_features(splits)
    train_feat_means = scaled_splits["train"][FEATURE_COLUMNS].mean().abs()
    assert_check((train_feat_means < 1e-2).all(), "StandardScaler centered train features at zero mean")
    # Validation mean is NOT forced to zero (proving scaler was not fit on validation)
    val_feat_means = scaled_splits["val"][FEATURE_COLUMNS].mean().abs()
    assert_check((val_feat_means > 1e-3).any(), "Validation partition retains out-of-sample distribution (scaler was not fit on val)")

    # 8. All four models train successfully
    candidates = get_model_candidates(random_state=42)
    assert_check(len(candidates) == 4, "Four candidate models configured")
    for name, model in candidates.items():
        model.fit(scaled_splits["train"][FEATURE_COLUMNS], scaled_splits["train"][TARGET_COLUMN])
        assert_check(hasattr(model, "classes_") or hasattr(model, "predict"), f"Model '{name}' trained successfully")

    # 9. Validation metrics generated
    val_preds = candidates["linear_baseline"].predict(scaled_splits["val"][FEATURE_COLUMNS])
    val_metrics = evaluate_predictions(scaled_splits["val"][TARGET_COLUMN].values, val_preds)
    assert_check("macro_f1" in val_metrics and "tier0_recall" in val_metrics and "tier2_precision" in val_metrics, "Validation metrics generated with priority keys")

    # 10. Test metrics generated
    test_preds = candidates["linear_baseline"].predict(scaled_splits["test"][FEATURE_COLUMNS])
    test_metrics = evaluate_predictions(scaled_splits["test"][TARGET_COLUMN].values, test_preds)
    assert_check("accuracy" in test_metrics and "macro_f1" in test_metrics, "Test metrics generated")

    # 11. Confusion matrices generated
    assert_check(len(val_metrics["confusion_matrix"]) == 3 and len(test_metrics["confusion_matrix"]) == 3, "Confusion matrices generated (3x3)")

    # 12. Probability predictions generated
    test_probs = compute_model_probabilities(candidates["linear_baseline"], scaled_splits["test"][FEATURE_COLUMNS])
    assert_check(test_probs.shape == (len(scaled_splits["test"]), 3), f"Probabilities generated with shape {test_probs.shape} (N, 3)")
    prob_sums = np.isclose(test_probs.sum(axis=1), 1.0)
    assert_check(prob_sums.all(), "Probabilities sum to 1.0 for each observation")

    # 13. Model comparison CSV exists
    comp_csv = os.path.join(ML_DIR, "reports", "model_comparison.csv")
    assert_check(os.path.exists(comp_csv), f"Model comparison CSV exists: {os.path.basename(comp_csv)}")
    if os.path.exists(comp_csv):
        df_comp = pd.read_csv(comp_csv)
        required_cols = [
            "model", "validation_accuracy", "validation_macro_f1",
            "validation_tier0_recall", "validation_tier2_precision",
            "test_accuracy", "test_macro_f1", "test_tier0_recall", "test_tier2_precision"
        ]
        assert_check(all(c in df_comp.columns for c in required_cols), "model_comparison.csv contains all required metric columns")

    # 14. Selected model artifact exists
    sel_model_path = os.path.join(ML_DIR, "models", "selected_model.joblib")
    assert_check(os.path.exists(sel_model_path), f"Selected model artifact exists: {os.path.basename(sel_model_path)}")

    # 15. Scaler artifact exists
    scaler_path = os.path.join(ML_DIR, "models", "scaler.joblib")
    assert_check(os.path.exists(scaler_path), f"Scaler artifact exists: {os.path.basename(scaler_path)}")

    # 16. Feature importance report exists
    feat_imp_csv = os.path.join(ML_DIR, "reports", "feature_importance.csv")
    assert_check(os.path.exists(feat_imp_csv), f"Feature importance CSV exists: {os.path.basename(feat_imp_csv)}")

    # 17. SHAP report exists
    shap_csv = os.path.join(ML_DIR, "reports", "shap_feature_importance.csv")
    assert_check(os.path.exists(shap_csv), f"SHAP report exists: {os.path.basename(shap_csv)}")

    # 18. Experiment report exists
    rep_path = os.path.join(ML_DIR, "reports", "task10_experiment_report.md")
    assert_check(os.path.exists(rep_path), f"Experiment report exists: {os.path.basename(rep_path)}")

    # 19. Test prediction file exists
    pred_csv = os.path.join(ML_DIR, "reports", "test_predictions.csv")
    assert_check(os.path.exists(pred_csv), f"Test predictions CSV exists: {os.path.basename(pred_csv)}")
    if os.path.exists(pred_csv):
        df_pred = pd.read_csv(pred_csv)
        pred_cols = ["date", "actual_regime", "predicted_regime", "probability_tier_0", "probability_tier_1", "probability_tier_2"]
        assert_check(all(c in df_pred.columns for c in pred_cols), "test_predictions.csv contains all required columns")

    # 20. Existing Task 9 verification still passes
    print("\n--- Running Task 9 Verification Regression ---")
    task9_script = r"C:\Users\palan\.gemini\antigravity-ide\brain\accadb4a-a679-4c7d-adf1-a55b7fb21a5c\scratch\verify_task9_setup.py"
    res9 = subprocess.run([sys.executable, task9_script], capture_output=True, text=True)
    assert_check(res9.returncode == 0, "Task 9 verification script exited cleanly with 0 returncode")

    print("\n==================================================")
    print(f"TASK 10 VERIFICATION RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_task10_verification()
