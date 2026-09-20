# Task 11: Integration of X-PISA ML Prediction Layer into InvestAI

**Project**: InvestAI / X-PISA  
**Module**: ML Prediction Layer & Hybrid Suitability Integration (Task 11)  
**Status**: Integrated, Deployed, and Verified Across Python, Node.js, and React  

---

## 1. System Architecture

The X-PISA architecture decouples behavioral investor profiling from empirical asset market-context signals. The existing deterministic rule-based suitability engine remains the foundational base layer, while the machine learning model provides an objective, non-personalized market performance regime modifier.

### Conceptual Information Flow Diagram

```
User
  │
  ▼
Risk Assessment & Profile (PostgreSQL)
  │
  ▼
Rule-Based Suitability Calculation (Base Score 0–100)
  │
  ├─────────────────────────────────────────┐
  │                                         │
Historical NIFTY 50 Benchmark Data         │
  │                                         │
  ▼                                         │
Causal Technical Feature Extraction (10 features)
  │                                         │
  ▼                                         │
Trained Model & StandardScaler (`ml/models/`)│
  │                                         │
  ▼                                         │
Regime Probabilities (P_tier0, P_tier1, P_tier2)
  │                                         │
  ▼                                         │
Market Context Adjustment (Bounded: -5 to +5 pts)
  │                                         │
  ├─────────────────────────────────────────┘
  ▼
Hybrid Suitability Score = Clamp(BaseSuitability + MLAdjustment, 0, 100)
  │
  ▼
Personalized Investment Recommendations API (`GET /api/recommendations`)
  │
  ▼
Transparent "Why This?" Explanation Modal (`GET /api/recommendations/explain`)
```

---

## 2. Python ML Prediction Service

### Service Implementation
- **FastAPI Microservice** (`ml/src/serve.py`):
  - `GET /health`: Service health check, model status, and expected feature schema.
  - `POST /predict`: Production inference for arbitrary 10-feature JSON vectors.
  - `GET /predict/latest`: Computes features up to the latest historical session of the verified NIFTY 50 benchmark dataset and returns regime probabilities.
- **Standalone CLI / Subprocess Interface** (`ml/src/predict.py`):
  - Provides `predict_from_features`, `predict_latest_benchmark`, and `predict_regime`.
  - Supports direct execution via `python -m ml.src.predict` for zero-dependency execution.

### Feature Order & Schema Guarantee
Strict adherence to Task 10 feature ordering:
1. `return_1d`
2. `return_5d`
3. `return_21d`
4. `volatility_21d`
5. `volatility_63d`
6. `volatility_ratio`
7. `sma_ratio_21_63`
8. `rsi_14`
9. `drawdown_63d`
10. `volume_ratio_21d` (Current session volume divided by 21-day average volume)

---

## 3. Node.js Backend Integration

### ML Client Service (`backend/src/services/mlService.js`)
1. **Dual-Transport Reliability**:
   - **Primary**: Communicates over local HTTP with the FastAPI service (`http://127.0.0.1:8000/predict/latest`) with a 2,500ms timeout.
   - **Secondary Fallback**: If the HTTP microservice is unreachable, Node automatically spawns a child process (`python -m ml.src.predict`) from workspace root to obtain the prediction.
   - **Tertiary Safe Degradation**: If Python is completely unavailable, the recommendation engine falls back gracefully to pure rule-based suitability (`mlAdjustment = 0`).

### Protected Node Endpoints
- **`GET /api/ml/prediction`** & **`GET /api/market/ml-prediction`**:
  - Enforces JWT authentication (`authenticateToken`).
  - Returns structured prediction with metadata, probabilities, and regulatory disclaimers.

---

## 4. Deterministic Hybrid Suitability Formula

To preserve regulatory compliance and protect user financial safety, the ML model **cannot** override the investor's verified risk assessment. The adjustment is strictly bounded:

$$\text{mlSignal} = P(\text{Tier 2 — Upward}) - P(\text{Tier 0 — Downward}) \in [-1.0, +1.0]$$

$$\text{mlAdjustment} = \text{round}\left(W_{\text{max}} \times \text{mlSignal} \times S_{\text{asset}}\right)$$

$$\text{hybridSuitability} = \max\left(0, \min\left(100, \text{baseSuitability} + \text{mlAdjustment}\right)\right)$$

### Parameter Specifications
- **$W_{\text{max}}$ (Maximum Adjustment Bound)**: **5 points** (maximum adjustment $\pm 5$ out of 100).
- **$S_{\text{asset}}$ (Asset Category Sensitivity)**:
  - Equities / Mutual Funds / Index Funds: $+1.0$ (pro-cyclical market momentum).
  - High-Risk / Aggressive Equities: $+1.2$ (magnified beta).
  - Government Bonds / Debt Funds: $-0.5$ (counter-cyclical defensive hedge; positive adjustment during downward market risk).
  - Gold & Precious Metals: $-0.3$ (inflation and volatility hedge).

---

## 5. Failure Fallback & Resilience

If the Python service is offline, uninstalled, or encounters an exception:
```json
{
  "available": false,
  "reason": "ML prediction service unavailable",
  "isLive": false
}
```
Under this fallback condition:
- $\text{mlAdjustment} = 0$.
- $\text{hybridSuitability} = \text{baseSuitability}$.
- Recommendations continue functioning normally without downtime or user error messages.

---

## 6. Recommendations & "Why This?" Explanation Updates

### Recommendations (`GET /api/recommendations`)
Returns both base suitability and hybrid suitability alongside the full market-context signal:
```json
{
  "id": 1,
  "name": "Large Cap Equity",
  "category": "Equity",
  "riskLevel": "Moderate",
  "baseSuitability": 95,
  "mlAdjustment": 0,
  "hybridSuitability": 95,
  "suitabilityScore": 95,
  "match": "HIGH"
}
```

### Explanation Modal (`GET /api/recommendations/explain`)
Clearly separates:
1. **User Profile Factors**: Risk category, risk score, investment horizon, experience level.
2. **Investment Characteristics**: Category, risk level, target horizon, liquidity.
3. **Market-Context Factor**: Predicted 21-day regime, probability distribution across Tier 0 / Tier 1 / Tier 2, and context adjustment points.
4. **Mandatory Disclaimer**:
   *"Market context is generated from a historical NIFTY 50 benchmark model and is not a personalized prediction of the investment's future return."*

---

## 7. Frontend User Experience

- **Recommendations Page** (`frontend/src/pages/Recommendations.jsx`):
  - Displays a clean **Market Context Signal** summary card showing the current 21-day regime (e.g. "Neutral / Stable") and class probabilities.
  - Displays "Base: X% · Context: ±Y%" breakdown badges on recommendation cards.
  - Emphasizes "Non-Live · Educational Decision Support".
- **Explanation Modal** (`frontend/src/components/RecommendationExplanation.jsx`):
  - Adds dedicated "Market Context Factor" section detailing the model output and probabilities.
  - Updates method badge to "Hybrid (Rule-Based + ML Market Context)".

---

## 8. Verification Results

All 19 verification requirements were tested:
1. Python model loads: **PASS**
2. Scaler loads: **PASS**
3. Feature ordering matches training: **PASS**
4. Prediction succeeds: **PASS**
5. Probabilities returned for all 3 classes: **PASS**
6. Probabilities sum to 1.0: **PASS**
7. Predicted class is valid integer (0, 1, or 2): **PASS**
8. Node communicates with Python ML layer: **PASS**
9. Unauthenticated request to `/api/ml/prediction` returns 401: **PASS**
10. Authenticated request to `/api/ml/prediction` returns 200: **PASS**
11. Recommendations API returns hybrid score and `mlContext`: **PASS**
12. Fallback works when ML is unavailable: **PASS**
13. ML adjustment is bounded within $\pm 5$ points: **PASS**
14. User profile remains separate from ML features: **PASS**
15. Explanation endpoint returns market context: **PASS**
16. Existing Tasks 1–8 APIs remain 100% operational: **PASS**
17. Task 9 verification suite: **PASS** (33/33 tests)
18. Task 10 verification suite: **PASS** (32/32 tests)
19. Frontend production build: **PASS** (built in 991ms with 0 errors)
