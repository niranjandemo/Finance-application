"""
Task 14 Verification Script
Verifies:
1. Ablation study results CSV exists and contains experiments A through F.
2. All 5 required metrics are recorded (Accuracy, Macro F1, Balanced Accuracy, Tier 0 Recall, Tier 2 Precision).
3. Feature importance CSV exists and contains complete ranking.
4. Task 14 comprehensive markdown report exists with all 9 required sections.
5. Production model and scaler artifacts remain 10-feature baseline (untouched).
6. Production model metadata remains 10-feature baseline (untouched).
7. Regression: Task 9 setup verification passes.
8. Regression: Task 10 verification passes.
9. Regression: Task 11 verification passes.
"""

import os
import sys
import json
import subprocess
import pandas as pd
import numpy as np
import joblib

WORKSPACE_DIR = r"c:\Users\palan\Documents\Final Proj"
ML_DIR = os.path.join(WORKSPACE_DIR, "ml")
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)
if WORKSPACE_DIR not in sys.path:
    sys.path.insert(0, WORKSPACE_DIR)

from src.features import FEATURE_COLUMNS


def run_task14_verification():
    print("==================================================")
    print("STARTING TASK 14 ABLATION & REGRESSION VERIFICATION")
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

    # 1. Ablation results CSV exists
    ablation_csv = os.path.join(ML_DIR, "reports", "ablation_results.csv")
    assert_check(os.path.exists(ablation_csv), f"Ablation results CSV exists: {os.path.basename(ablation_csv)}")

    if os.path.exists(ablation_csv):
        df_abl = pd.read_csv(ablation_csv)
        assert_check(len(df_abl) == 6, f"All 6 experiments (A-F) present in ablation_results.csv (found {len(df_abl)})")

        exp_codes = df_abl["experiment"].tolist()
        expected_codes = ["Exp_A", "Exp_B", "Exp_C", "Exp_D", "Exp_E", "Exp_F"]
        assert_check(all(c in exp_codes for c in expected_codes), f"All experiment codes present: {expected_codes}")

        # 2. Check metrics columns
        req_metrics = [
            "val_accuracy", "val_macro_f1", "val_balanced_accuracy", "val_tier0_recall", "val_tier2_precision",
            "test_accuracy", "test_macro_f1", "test_balanced_accuracy", "test_tier0_recall", "test_tier2_precision",
        ]
        assert_check(all(m in df_abl.columns for m in req_metrics), "All 5 required validation & test metrics present in ablation table")

        # Check values are valid non-null floats
        all_numeric = df_abl[req_metrics].notnull().all().all()
        assert_check(all_numeric, "All metric values are valid non-null numerical values")

    # 3. Feature importance CSV exists and ranked
    feat_csv = os.path.join(ML_DIR, "reports", "feature_importance.csv")
    assert_check(os.path.exists(feat_csv), f"Feature importance CSV exists: {os.path.basename(feat_csv)}")

    if os.path.exists(feat_csv):
        df_feat = pd.read_csv(feat_csv)
        assert_check(len(df_feat) == 10, f"All 10 baseline features present in importance table (found {len(df_feat)})")
        assert_check("Feature" in df_feat.columns and "Rank" in df_feat.columns, "Feature importance table contains Feature and Rank columns")
        assert_check(df_feat["Rank"].tolist() == list(range(1, 11)), "Features are sorted and ranked from 1 to 10")

    # 4. Task 14 markdown report exists with 9 sections
    rep_md = os.path.join(ML_DIR, "reports", "task14_feature_ablation_report.md")
    assert_check(os.path.exists(rep_md), f"Task 14 report exists: {os.path.basename(rep_md)}")

    if os.path.exists(rep_md):
        with open(rep_md, "r", encoding="utf-8") as f:
            content = f.read()
        sections = [
            "1. Baseline Features",
            "2. Baseline Model Performance",
            "3. Feature Importance Ranking",
            "4. Ablation Experiment Results",
            "5. Comparison of Experiments",
            "6. Key Findings",
            "7. Recommended Feature Configuration",
            "8. Confirmation of Production Safety",
            "9. Regression Test Results",
        ]
        for s in sections:
            assert_check(s in content, f"Report contains section: '{s}'")

    # 5. Production model and scaler artifacts remain 10-feature baseline
    print("\n--- Checking Production Safety & Artifact Preservation ---")
    model_path = os.path.join(ML_DIR, "models", "selected_model.joblib")
    scaler_path = os.path.join(ML_DIR, "models", "scaler.joblib")
    meta_path = os.path.join(ML_DIR, "models", "model_metadata.json")

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    with open(meta_path, "r") as f:
        meta = json.load(f)

    assert_check(scaler.n_features_in_ == 10, f"Production scaler retains 10 features (n_features_in_={scaler.n_features_in_})")
    assert_check(model.coef_.shape[1] == 10, f"Production model retains 10-feature coefficients (shape={model.coef_.shape})")
    assert_check(len(meta["feature_names"]) == 10, "Production metadata retains all 10 baseline feature names")
    assert_check(meta["feature_names"] == FEATURE_COLUMNS, "Production feature names and ordering strictly match FEATURE_COLUMNS")

    # 6. Full regression tests
    print("\n--- Running Task 9 Verification Regression ---")
    task9_script = r"C:\Users\palan\.gemini\antigravity-ide\brain\accadb4a-a679-4c7d-adf1-a55b7fb21a5c\scratch\verify_task9_setup.py"
    res9 = subprocess.run([sys.executable, task9_script], capture_output=True, text=True)
    assert_check(res9.returncode == 0, f"Task 9 verification passed cleanly")

    print("\n--- Running Task 10 Verification Regression ---")
    task10_script = os.path.join(ML_DIR, "scratch", "verify_task10.py")
    res10 = subprocess.run([sys.executable, task10_script], capture_output=True, text=True)
    assert_check(res10.returncode == 0, f"Task 10 verification passed cleanly")

    print("\n--- Running Task 11 Verification Regression ---")
    task11_script = os.path.join(ML_DIR, "scratch", "verify_task11.py")
    res11 = subprocess.run([sys.executable, task11_script], capture_output=True, text=True)
    assert_check(res11.returncode == 0, f"Task 11 verification passed cleanly")

    print("\n==================================================")
    print(f"TASK 14 VERIFICATION RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_task14_verification()
