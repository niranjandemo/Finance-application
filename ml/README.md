# X-PISA: Explainable Personalized Investment Suitability Architecture
## Machine Learning Experiment Specification & Research Protocol

**Project**: InvestAI / X-PISA  
**Module**: AI/ML Predictive Layer & Explainability Experiment (Task 9)  
**Status**: Experiment Defined & Scaffolding Prepared (Pre-Training Phase)  
**Target Publication Target**: IEEE Conference / Journal on Financial Machine Learning & Human-AI Collaboration  

---

## 1. Problem Statement

Traditional robo-advisory systems and suitability engines (such as the Phase 1 implementation in Tasks 1–6) rely exclusively on static, deterministic rule-based heuristics. While these rules provide transparency and regulatory compliance, they possess an inherent limitation: **they treat asset class return and risk characteristics as static constants**, ignoring cyclical macroeconomic fluctuations, shifting volatility regimes, and market momentum.

Conversely, naive machine-learning financial predictors often suffer from:
1. **Circular Learning**: Training an ML model to predict a user's risk score or suitability rating directly from the user's questionnaire responses—simply mimicking the deterministic formula without genuine predictive utility.
2. **Noise Fitting**: Attempting high-frequency point-price regression ($R^2 \approx 0$ on out-of-sample data) leading to erratic portfolio recommendations.

### X-PISA Solution
X-PISA decouples market risk/return regime prediction from user behavioral profiling:
1. An empirical machine learning classifier learns **Forward Risk-Adjusted Asset Performance Regimes** from multi-year historical market time series.
2. An explainable attribution layer computes feature contributions (e.g. why an asset was classified as entering a drawdown regime).
3. A post-prediction personalization layer synthesizes this empirical regime prediction with the investor's verified risk category and horizon, dynamically adjusting suitability weighting.

---

## 2. Research Objective

To empirically evaluate whether machine-learning classifiers (Random Forest, Gradient Boosting) trained on causal technical and macro indicators can reliably predict forward 21-day performance regimes (Drawdown Risk vs. Neutral vs. Outperforming) on out-of-sample Indian market benchmark data (2023–2024), and to provide transparent, interpretable explanations for each prediction.

---

## 3. Dataset Selection & Provenance

- **Primary Asset**: NIFTY 50 Index (`^NSEI`) & bellwether large-cap components (`RELIANCE`, `TCS`, `INFY`, `HDFCBANK`, `ICICIBANK`, `GOLDBEES`).
- **Benchmark Source**: National Stock Exchange of India (NSE) / Kaggle Open Data (*NIFTY-50 Stock Market Data* by Rohan Rao, CC0 1.0 Universal Public Domain).
- **Date Range**: 2015-01-01 to 2024-12-31 (10 calendar years, 2,609 raw trading observations).
- **Frequency**: Daily OHLCV (Open, High, Low, Close, Volume).

---

## 4. Target Variable Definition

- **Target Identifier**: `target_regime`
- **Type**: 3-Class Discrete Ordinal Classification
- **Prediction Horizon**: $H = 21$ trading days (~1 calendar month forward holding period)
- **Mathematical Formula**:
  $$R_{t+1:t+21} = \frac{\text{Close}_{t+21} - \text{Close}_t}{\text{Close}_t}$$
  $$\text{target\_regime} = \begin{cases}
  0 \text{ (Drawdown Risk / Underperforming)} & \text{if } R_{t+1:t+21} < -2.0\% \\
  1 \text{ (Neutral / Benchmark Stable)} & \text{if } -2.0\% \le R_{t+1:t+21} \le +3.0\% \\
  2 \text{ (Favorable / Outperforming)} & \text{if } R_{t+1:t+21} > +3.0\%
  \end{cases}$$

---

## 5. Input Feature Set (Strictly Causal $\le t$)

All 10 engineered features are computed strictly from historical prices up to the market close of trading day $t$:

| Feature Name | Category | Formula / Definition | Lookback Window |
|---|---|---|---|
| `return_1d` | Momentum | $(Close_t - Close_{t-1}) / Close_{t-1}$ | 1 day |
| `return_5d` | Momentum | $(Close_t - Close_{t-5}) / Close_{t-5}$ | 5 days (1 week) |
| `return_21d` | Trend | $(Close_t - Close_{t-21}) / Close_{t-21}$ | 21 days (1 month) |
| `volatility_21d` | Risk | $\sigma(\text{returns}_{t-20:t}) \times \sqrt{252}$ | 21 days |
| `volatility_63d` | Risk Baseline | $\sigma(\text{returns}_{t-62:t}) \times \sqrt{252}$ | 63 days (1 quarter) |
| `volatility_ratio` | Risk Acceleration | $\text{volatility\_21d} / \text{volatility\_63d}$ | 21d / 63d |
| `sma_ratio_21_63` | Trend Convergence | $\text{SMA}_{21} / \text{SMA}_{63}$ | 21d / 63d |
| `rsi_14` | Oscillator | Wilder's RSI on Close | 14 days |
| `drawdown_63d` | Tail Risk | $(Close_t - \max(High_{t-62:t})) / \max(High_{t-62:t})$ | 63 days |
| `volume_ratio_21d` | Liquidity Momentum | $Volume_t / \text{mean}(Volume_{t-20:t})$ | 21 days |

---

## 6. Preprocessing & Zero-Leakage Split Strategy

1. **Boundary Truncation**:
   - First 63 days dropped due to trailing 63-day rolling volatility and drawdown calculations.
   - Last 21 days dropped from training due to unobserved forward target.
2. **Chronological Walk-Forward Partitioning**:
   - **Training Set (70%)**: 2015-01-01 to 2021-12-31 (7 years)
   - **Validation Set (10%)**: 2022-01-01 to 2022-12-31 (1 year, rate-hike shock regime)
   - **Out-of-Sample Test Set (20%)**: 2023-01-01 to 2024-12-31 (2 years, unseen market expansion)
3. **Scaler Hygiene**:
   - `StandardScaler` is fitted **strictly on the Training set**. Validation and Test sets are transformed using training scale parameters to prevent distribution leakage.

---

## 7. Baseline Formulations

- **System Baseline**: Existing Phase 1 Rule-Based Suitability Model (Task 4/5).
- **Statistical Lower Bound**: `DummyClassifier(strategy='most_frequent')` (Majority class naive prediction).
- **Linear Machine Learning Baseline**: Multinomial Logistic Regression ($L_2$ penalized, `C=1.0`).

---

## 8. Candidate Models

1. **Multinomial Logistic Regression**:
   - *Advantages*: Convex optimization, transparent coefficients, direct odds-ratio interpretation.
   - *Disadvantages*: Cannot capture non-linear volatility-momentum interactions.
2. **Random Forest Classifier**:
   - *Advantages*: Non-parametric, robust to outliers, captures non-linear feature thresholding, natural MDI and Permutation Importance.
   - *Disadvantages*: Can produce step-function boundaries; requires depth control to prevent memorization.
3. **Histogram-based Gradient Boosting (LightGBM/HistGradientBoosting)**:
   - *Advantages*: State-of-the-art on tabular financial time series, sequential residual learning.
   - *Disadvantages*: Higher risk of overfitting without regularized shrinkage and tree depth constraints.

---

## 9. Evaluation Metrics

- **Macro F1-Score (Primary Optimization Target)**: Evaluates unweighted balance across all 3 classes.
- **Drawdown Detection Recall (Tier 0 Recall)**: Measures the proportion of high-drawdown periods successfully identified before they occur.
- **Outperformance Precision (Tier 2 Precision)**: Measures the purity of buy/accumulation regime signals.
- **Confusion Matrix & Balanced Accuracy**.

---

## 10. Explainable AI (XAI) Protocol

For the chosen ensemble model (Random Forest / Gradient Boosting):
1. **Global Explainability**:
   - Permutation Feature Importance evaluated across the Out-of-Sample Test period.
2. **Local Instance Explainability**:
   - SHAP (SHapley Additive exPlanations) values computed via `TreeExplainer`.
   - Each individual asset recommendation will receive a local SHAP attribution vector explaining the exact drivers behind its predicted regime (e.g. elevated volatility ratio, breakdown below 63-day SMA).
3. **Human-Centric Translation**:
   - Technical SHAP values will be mapped to plain-language factors (e.g. "Elevated short-term volatility relative to quarterly baseline reduced suitability score by 12 points for your Moderate risk profile").

---

## 11. Limitations & Safety Boundary

- **Decision-Support Only**: Model outputs are predictive statistical likelihoods, not guaranteed investment returns.
- **Regime Shift Risk**: Black-swan macroeconomic events (e.g. unexpected geopolitical shocks) may cause temporary prediction degradation.
- **Non-Execution**: X-PISA provides informational decision support and does not execute trades.

---

## 12. Model Evaluation & Selection (Task 10 Summary)

- **Models Evaluated**: `naive_baseline`, `linear_baseline`, `primary_random_forest`, `primary_gradient_boosting`.
- **Validation-Based Winner**: `linear_baseline` (Logistic Regression) selected based on strict priority:
  $$\text{Macro F1 (0.3144)} \longrightarrow \text{Tier 0 Recall (0.2041)} \longrightarrow \text{Tier 2 Precision (0.3617)} \longrightarrow \text{Accuracy (0.3138)}$$
- **Test Generalization (2023–2024)**: Test Accuracy 41.32%, Tier 2 Precision 48.33%.

---

## 13. Production Hybrid Suitability Architecture (Task 11)

Task 11 integrates the trained ML prediction layer into the production Node.js/Express backend and React UI as an objective market-context modifier.

### End-to-End Conceptual Pipeline
```
User -> Risk Assessment & Profile -> Rule-Based Base Suitability (0-100)
                                      +
Historical NIFTY 50 Benchmark Data -> Causal Features -> Trained Model -> Regime Probabilities -> Bounded Adjustment (-5 to +5 pts)
                                      ||
                             Hybrid Suitability Score (0-100)
                                      ||
                             Recommendations & "Why This?" Modal
```

### Deterministic Hybrid Scoring Formula
$$\text{mlSignal} = P(\text{Tier 2 — Upward}) - P(\text{Tier 0 — Downward}) \in [-1.0, +1.0]$$
$$\text{mlAdjustment} = \text{round}\left(W_{\text{max}} \times \text{mlSignal} \times S_{\text{asset}}\right)$$
$$\text{hybridSuitability} = \max\left(0, \min\left(100, \text{baseSuitability} + \text{mlAdjustment}\right)\right)$$
- $W_{\text{max}} = 5$ points maximum adjustment bound.
- $S_{\text{asset}} \in [-0.5, +1.2]$ depending on asset class risk/counter-cyclical hedging characteristics.
- If ML is unavailable: $\text{mlAdjustment} = 0 \implies \text{hybridSuitability} = \text{baseSuitability}$ (Zero-Downtime Fallback).

### Services & Endpoints
- **Python FastAPI Service** (`ml/src/serve.py`): Port 8000 (`/predict`, `/predict/latest`, `/health`).
- **Node.js ML Service** (`backend/src/services/mlService.js`): Dual HTTP + subprocess execution fallback.
- **Protected Node Endpoints**: `GET /api/ml/prediction`, `GET /api/recommendations`, `GET /api/recommendations/explain`.

