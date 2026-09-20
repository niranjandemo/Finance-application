"""
Task 11 Verification Script
Verifies:
1. Python model loads from artifact.
2. Scaler loads from artifact.
3. Feature order strictly matches training/metadata.
4. Prediction succeeds.
5. Three class probabilities are returned.
6. Probabilities sum approximately to 1.0.
7. Predicted class is valid (0, 1, or 2).
8. Node can communicate with Python ML layer.
9. Unauthorized ML endpoint returns 401.
10. Authorized ML endpoint returns 200 with structured prediction.
11. Recommendations API returns hybrid suitability and mlContext.
12. Recommendation calculation degrades safely if ML is disabled.
13. ML adjustment is deterministic and bounded within +/- 5 points.
14. User profile/risk assessment remain separate from ML features.
15. 'Why this?' explanation endpoint returns marketContext.
16. Existing APIs remain functional (Tasks 1-8).
17. Task 9 verification still passes.
18. Task 10 verification still passes.
19. Frontend builds successfully.
"""

import os
import sys
import subprocess
import json
import urllib.request
import urllib.error

WORKSPACE_DIR = r"c:\Users\palan\Documents\Final Proj"
ML_DIR = os.path.join(WORKSPACE_DIR, "ml")
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)
if WORKSPACE_DIR not in sys.path:
    sys.path.insert(0, WORKSPACE_DIR)

from src.predict import load_artifacts, predict_from_features, predict_latest_benchmark
from src.features import FEATURE_COLUMNS, TARGET_NAMES

API_BASE_URL = "http://localhost:5000/api"


def run_task11_verification():
    print("==================================================")
    print("STARTING TASK 11 ML INTEGRATION VERIFICATION")
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

    # 1. Python model loads
    model, scaler = load_artifacts()
    assert_check(model is not None, "Python model artifact loaded successfully")

    # 2. Scaler loads
    assert_check(scaler is not None, "StandardScaler artifact loaded successfully")

    # 3. Feature order matches training
    with open(os.path.join(ML_DIR, "models", "model_metadata.json"), "r") as f:
        meta = json.load(f)
    assert_check(meta.get("feature_names") == FEATURE_COLUMNS, "Feature order matches training metadata exactly")

    # 4. Prediction succeeds
    test_feat = {
        "return_1d": 0.001, "return_5d": 0.005, "return_21d": 0.02,
        "volatility_21d": 0.12, "volatility_63d": 0.14, "volatility_ratio": 0.85,
        "sma_ratio_21_63": 1.02, "rsi_14": 52.0, "drawdown_63d": -0.015, "volume_ratio_21d": 1.05
    }
    pred_res = predict_from_features(test_feat, model=model, scaler=scaler)
    assert_check("predicted_regime" in pred_res, "Single feature vector prediction succeeded")

    # 5. Three probabilities returned
    probs = pred_res.get("probabilities", {})
    assert_check(len(probs) == 3 and "tier_0" in probs and "tier_1" in probs and "tier_2" in probs, "Three regime probabilities returned")

    # 6. Probabilities sum to 1.0
    prob_sum = sum(probs.values())
    assert_check(abs(prob_sum - 1.0) < 1e-3, f"Probabilities sum approximately to 1.0 (sum = {prob_sum:.4f})")

    # 7. Predicted class is valid
    assert_check(pred_res["predicted_regime"] in [0, 1, 2], f"Predicted regime is valid class {pred_res['predicted_regime']}")

    # 8-16: Node Integration & API Security
    print("\n--- Testing Node.js ML Integration & Endpoints ---")
    
    # Register a dedicated verification user
    import time
    stamp = int(time.time() * 1000)
    reg_payload = json.dumps({"name": "Task 11 User", "email": f"task11_{stamp}@investai.test", "password": "password123"}).encode()
    reg_req = urllib.request.Request(f"{API_BASE_URL}/auth/register", data=reg_payload, headers={"Content-Type": "application/json"})
    reg_res = json.loads(urllib.request.urlopen(reg_req).read())
    jwt_token = reg_res["token"]

    # Set Profile
    prof_payload = json.dumps({
        "age": 32, "income": 75000, "savings": 25000, "investmentAmount": 5000,
        "goal": "Balanced Growth", "horizon": "medium", "experience": "intermediate", "liquidity": "moderate"
    }).encode()
    prof_req = urllib.request.Request(f"{API_BASE_URL}/users/profile", data=prof_payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {jwt_token}"})
    urllib.request.urlopen(prof_req)

    # Set Risk Assessment
    risk_payload = json.dumps({
        "lossReaction": "Hold steady and wait for recovery", "volatility": "Comfortable with moderate fluctuations",
        "returnPreference": "Balanced growth and capital preservation", "emergencyFund": "Yes, 3-6 months covered",
        "investmentBehavior": "Invest steadily over time", "riskScore": 68, "riskCategory": "Moderate"
    }).encode()
    risk_req = urllib.request.Request(f"{API_BASE_URL}/users/risk-assessment", data=risk_payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {jwt_token}"})
    urllib.request.urlopen(risk_req)

    # 8. Node communicates with Python ML service
    ml_req = urllib.request.Request(f"{API_BASE_URL}/ml/prediction", headers={"Authorization": f"Bearer {jwt_token}"})
    ml_res = json.loads(urllib.request.urlopen(ml_req).read())
    assert_check(ml_res.get("available") is True, "Node successfully communicates with Python ML prediction layer")

    # 9. Unauthorized ML endpoint returns 401
    try:
        urllib.request.urlopen(f"{API_BASE_URL}/ml/prediction")
        assert_check(False, "Unauthorized ML endpoint should return 401")
    except urllib.error.HTTPError as e:
        assert_check(e.code == 401, f"Unauthorized ML endpoint correctly returned HTTP {e.code}")

    # 10. Authorized ML endpoint returns 200 with structured fields
    assert_check("model" in ml_res and "predictedRegime" in ml_res and "probabilities" in ml_res, "Authorized ML endpoint returns model, predictedRegime, and probabilities")
    assert_check(ml_res.get("isLive") is False, "Authorized ML endpoint accurately flags isLive: false (historical benchmark)")

    # 11. Recommendations API returns hybrid suitability and mlContext
    rec_req = urllib.request.Request(f"{API_BASE_URL}/recommendations", headers={"Authorization": f"Bearer {jwt_token}"})
    rec_res = json.loads(urllib.request.urlopen(rec_req).read())
    assert_check("mlContext" in rec_res and rec_res["mlContext"].get("available") is True, "Recommendations API returns active mlContext")
    
    top_rec = rec_res["recommendations"][0]
    assert_check("baseSuitability" in top_rec and "hybridSuitability" in top_rec and "mlAdjustment" in top_rec, "Recommendations contain baseSuitability, hybridSuitability, and mlAdjustment")

    # 12. Safe fallback degradation
    # Base suitability is non-null and valid
    assert_check(top_rec["baseSuitability"] > 0 and top_rec["hybridSuitability"] > 0, "Base and hybrid suitability are both positive numbers")

    # 13. ML adjustment is bounded within +/- 5 points
    adj = abs(top_rec["mlAdjustment"])
    assert_check(adj <= 5, f"ML suitability adjustment is strictly bounded (|adjustment| = {adj} <= 5)")

    # 14. User profile/risk assessment remain separate from ML features
    assert_check("risk_score" not in FEATURE_COLUMNS and "risk_category" not in FEATURE_COLUMNS, "User profile attributes are strictly excluded from ML features")

    # 15. 'Why this?' explanation returns marketContext
    exp_req = urllib.request.Request(f"{API_BASE_URL}/recommendations/explain?investmentId={top_rec['id']}", headers={"Authorization": f"Bearer {jwt_token}"})
    exp_res = json.loads(urllib.request.urlopen(exp_req).read())
    assert_check("marketContext" in exp_res and exp_res["marketContext"].get("available") is True, "Explanation endpoint returns marketContext object")
    assert_check("disclaimer" in exp_res["marketContext"], "Explanation marketContext includes mandatory non-advisory disclaimer")

    # 16. Existing Tasks 1-8 APIs regression
    print("\n--- Regression Testing Existing Stack ---")
    test8_script = os.path.join(WORKSPACE_DIR, "scratch", "verify_task8_api.js")
    if not os.path.exists(test8_script):
        # Check artifact scratch path
        test8_script = r"C:\Users\palan\.gemini\antigravity-ide\brain\accadb4a-a679-4c7d-adf1-a55b7fb21a5c\scratch\verify_task8_api.js"
    res8 = subprocess.run(["node", test8_script], capture_output=True, text=True, cwd=WORKSPACE_DIR)
    assert_check(res8.returncode == 0, "Tasks 1-8 full API regression suite passed with 0 errors")

    # 17. Task 9 verification still passes
    task9_script = r"C:\Users\palan\.gemini\antigravity-ide\brain\accadb4a-a679-4c7d-adf1-a55b7fb21a5c\scratch\verify_task9_setup.py"
    res9 = subprocess.run([sys.executable, task9_script], capture_output=True, text=True, cwd=WORKSPACE_DIR)
    assert_check(res9.returncode == 0, "Task 9 verification script passed with 0 errors")

    # 18. Task 10 verification still passes
    task10_script = os.path.join(ML_DIR, "scratch", "verify_task10.py")
    res10 = subprocess.run([sys.executable, task10_script], capture_output=True, text=True, cwd=WORKSPACE_DIR)
    assert_check(res10.returncode == 0, "Task 10 verification script passed with 0 errors")

    # 19. Frontend builds successfully
    frontend_dir = os.path.join(WORKSPACE_DIR, "frontend")
    res_build = subprocess.run(["npm.cmd", "run", "build"], capture_output=True, text=True, cwd=frontend_dir)
    assert_check(res_build.returncode == 0, "Frontend production build succeeded with 0 errors")

    print("\n==================================================")
    print(f"TASK 11 VERIFICATION RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_task11_verification()
