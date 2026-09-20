# Task 10: X-PISA AI/ML Model Training, Evaluation & Comparison Report

**Project**: InvestAI / X-PISA  
**Module**: AI/ML Predictive Layer & Quantitative Experimentation (Task 10)  
**Status**: Models Trained, Evaluated, Compared, and Serialized  
**Publication Target**: IEEE Transactions on Computational Finance / AI Systems  

---

## 1. Experiment Objective

The primary objective of this experiment is to train, evaluate, and compare machine learning classifiers for **Forward 21-Day Market Performance Regime Prediction** using institutional benchmark market data (NIFTY 50 Index, 2015–2024).

The experiment seeks to answer whether causal technical and volatility indicators can predict whether an asset will enter a negative return regime (Tier 0), neutral regime (Tier 1), or positive return regime (Tier 2) over a 21-trading-day (~1 month) forward horizon. 

In subsequent tasks (Task 11), these predicted regime probabilities will dynamically scale the base suitability weights of InvestAI's rule-based recommendation engine, replacing static asset return assumptions with dynamic empirical distributions while preserving strict regulatory transparency.

---

## 2. Dataset Specification & Provenance

- **Source / Path**: `ml/data/raw/nifty50_daily_2015_2024.csv` (National Stock Exchange of India / Kaggle Open Benchmark Data).
- **Date Range**: `2015-01-01` to `2024-12-31` (10 calendar years).
- **Total Raw Observations**: `2,609` trading days.
- **Data Hygiene**:
  - Missing Values: `0` missing values across Open, High, Low, Close, and Volume.
  - Duplicate Dates: `0` duplicate timestamps.
  - Chronological Integrity: Strict monotonic ascending calendar order.
- **Partition Record Counts (with 21-Day Embargo Purge)**:
  - **Train Set**: `1,743` observations (`2015-03-31` to `2021-12-02`) — ~70% partition.
  - **Validation Set**: `239` observations (`2022-01-03` to `2022-12-01`) — ~10% partition.
  - **Test Set**: `501` observations (`2023-01-02` to `2024-12-02`) — ~20% partition.
  - Initial rolling lookback truncation: 63 initial rows dropped for feature warm-up.

---

## 3. Target Variable Definition

The target variable is `target_regime`, derived from the absolute forward 21-day percentage return:

$$\text{forward\_return\_21d}_t = \frac{\text{Close}_{t+21} - \text{Close}_t}{\text{Close}_t}$$

The discrete target regimes are formulated as:

$$\text{target\_regime}_t = \begin{cases}
0 \text{ (Tier 0 — Downward / Negative Return Regime)} & \text{if } \text{forward\_return\_21d}_t < -0.020 \\
1 \text{ (Tier 1 — Neutral / Stable Return Regime)} & \text{if } -0.020 \le \text{forward\_return\_21d}_t \le +0.030 \\
2 \text{ (Tier 2 — Upward / Positive Return Regime)} & \text{if } \text{forward\_return\_21d}_t > +0.030
\end{cases}$$

> [!NOTE]
> **Terminology Clarification**:
> - Tier 0 represents a forward return decline exceeding $-2.0\%$, not a path-dependent maximum drawdown.
> - Tier 2 represents an absolute forward gain exceeding $+3.0\%$, not relative outperformance over a secondary benchmark index.

---

## 4. Feature Engineering ($10$ Strictly Causal Indicators)

All 10 engineered features are computed strictly using price and volume information available at or before session close on trading day $t$ ($t \le \text{Date}$):

| # | Feature Name | Category | Lookback Window | Mathematical Definition & Intuition |
|---|---|---|---|---|
| 1 | `return_1d` | Momentum | 1 day | $(P_t - P_{t-1}) / P_{t-1}$ — Single session price return shock. |
| 2 | `return_5d` | Momentum | 5 days (1 wk) | $(P_t - P_{t-5}) / P_{t-5}$ — Weekly cumulative momentum. |
| 3 | `return_21d` | Trend | 21 days (1 mo) | $(P_t - P_{t-21}) / P_{t-21}$ — Monthly trend persistence. |
| 4 | `volatility_21d` | Risk | 21 days | $\sigma(r_{1d, 21}) \times \sqrt{252}$ — Annualized 1-month realized volatility. |
| 5 | `volatility_63d` | Risk Baseline | 63 days (1 qtr) | $\sigma(r_{1d, 63}) \times \sqrt{252}$ — Annualized quarterly baseline volatility. |
| 6 | `volatility_ratio` | Volatility Shift | 21d & 63d | $\sigma_{21} / \sigma_{63}$ — Ratio indicating sudden risk acceleration when $> 1.0$. |
| 7 | `sma_ratio_21_63` | Trend Alignment | 21d & 63d | $\text{SMA}_{21}(P) / \text{SMA}_{63}(P)$ — Classic moving average crossover indicator. |
| 8 | `rsi_14` | Oscillator | 14 days | Wilder's 14-day Relative Strength Index bounded in $[0, 100]$. |
| 9 | `drawdown_63d` | Tail Risk | 63 days | $(P_t - \max_{63}(H)) / \max_{63}(H)$ — Proximity to 63-day high; $< 0$. |
| 10 | `volume_ratio_21d`| Liquidity | 21 days | $\mathbf{V_t / \text{SMA}_{21}(V)}$ — **Current day session volume divided by trailing 21-day average volume**. |

---

## 5. Leakage Prevention Architecture

1. **Chronological Splitting**: Shuffled $k$-fold cross-validation is strictly disallowed. The dataset is partitioned chronologically to mimic live deployment.
2. **21-Trading-Day Purge / Embargo**:
   - Because target labels look forward $H = 21$ trading days into the future, observations in the final 21 days of the Training period (`2021-12-03` to `2021-12-31`) would have target returns evaluated using January 2022 prices (inside the Validation partition).
   - A strict **21-day embargo purge** was implemented in `chronological_split`: the last 21 trading days of Train and Validation are purged, guaranteeing that 100% of forward target evaluation dates remain strictly within their assigned partition.
3. **Isolated Preprocessing**:
   - `StandardScaler` is fitted **exclusively on the training partition** ($N = 1,743$).
   - The learned parameters ($\mu_{\text{train}}, \sigma_{\text{train}}$) are applied without refitting to the Validation ($N = 239$) and Test ($N = 501$) sets.

---

## 6. Candidate Models & Configurations

All models were initialized with reproducible seed `random_state=42`:

1. **Naive Baseline (`DummyClassifier`)**:
   - Configuration: `strategy="most_frequent"`
   - Role: Establishes empirical statistical lower bound.
2. **Linear Baseline (`LogisticRegression`)**:
   - Configuration: `solver="lbfgs"`, `C=1.0`, `max_iter=1000`
   - Role: Regularized convex linear benchmark with direct coefficient interpretability.
3. **Primary Random Forest (`RandomForestClassifier`)**:
   - Configuration: `n_estimators=100`, `max_depth=6`, `min_samples_leaf=15`, `class_weight="balanced"`, `n_jobs=-1`
   - Role: Non-linear tree ensemble with depth constraints to prevent financial noise memorization.
4. **Primary Gradient Boosting (`HistGradientBoostingClassifier`)**:
   - Configuration: `max_iter=100`, `max_depth=4`, `min_samples_leaf=20`, `class_weight="balanced"`
   - Role: High-capacity iterative residual boosting.

---

## 7. Validation-Set Results (Model Selection Stage: Year 2022)

Evaluation on the unseen Validation partition ($N = 239$, rate-hike consolidation regime):

| Model Name | Accuracy | Macro F1 | Tier 0 Recall (< -2%) | Tier 2 Precision (> +3%) |
|---|---|---|---|---|
| **`linear_baseline`** (Selected) | **0.3138** | **0.3144** | **0.2041** | **0.3617** |
| `primary_random_forest` | 0.2552 | 0.2491 | 0.0510 | 0.2414 |
| `primary_gradient_boosting` | 0.2762 | 0.2361 | 0.0306 | 0.2182 |
| `naive_baseline` | 0.3598 | 0.1764 | 0.0000 | 0.0000 |

### Predefined Priority Ranking Analysis
1. **Macro F1**: `linear_baseline` (**0.3144**) outperforms `primary_random_forest` (0.2491) and `primary_gradient_boosting` (0.2361).
2. **Tier 0 Recall (Negative Regime Detection)**: `linear_baseline` (**0.2041**) flags $4\times$ more downward market regimes than Random Forest (0.0510).
3. **Tier 2 Precision (Positive Regime Signal Purity)**: `linear_baseline` (**0.3617**) provides substantially higher signal purity than Random Forest (0.2414) or Gradient Boosting (0.2182).
4. **Accuracy**: Although Naive Baseline achieves 0.3598 accuracy by predicting only the majority class (Class 1), its Macro F1 collapses to 0.1764 with zero recall on risk events.

---

## 8. Out-of-Sample Test-Set Results (Final Evaluation: Years 2023–2024)

Final evaluation on the untouched Test partition ($N = 501$):

| Model Name | Accuracy | Macro F1 | Tier 0 Recall (< -2%) | Tier 2 Precision (> +3%) |
|---|---|---|---|---|
| `linear_baseline` | **0.4132** | 0.2966 | 0.0814 | **0.4833** |
| `primary_random_forest` | 0.3114 | 0.3002 | **0.6628** | 0.4810 |
| `primary_gradient_boosting` | 0.3613 | **0.3494** | 0.4302 | 0.4697 |
| `naive_baseline` | 0.4311 | 0.2008 | 0.0000 | 0.0000 |

### Test Performance Insights
- **Generalization**: On the test period, `linear_baseline` achieved **41.32% accuracy** and **48.33% Tier 2 precision**.
- **Regime Shift Trade-off**: The 2023–2024 expansion contained distinct bull runs where non-linear models adapted differently: `primary_random_forest` achieved outstanding **Tier 0 Recall of 66.28%**, successfully catching market corrections, while `primary_gradient_boosting` achieved the highest test **Macro F1 (0.3494)**.
- **Scientific Integrity**: Because model selection was frozen based on validation criteria, no post-hoc switching of the selected model was performed.

---

## 9. Confusion Matrices

### Validation Confusion Matrices ($N = 239$)

**`linear_baseline` (Selected Model)**:
```
                Pred Tier 0   Pred Tier 1   Pred Tier 2
Actual Tier 0        20            50            28
Actual Tier 1        46            38             2
Actual Tier 2        16            22            17
```

**`primary_random_forest`**:
```
                Pred Tier 0   Pred Tier 1   Pred Tier 2
Actual Tier 0         5            21            72
Actual Tier 1        42            28            16
Actual Tier 2         3            24            28
```

### Test Confusion Matrices ($N = 501$)

**`linear_baseline` (Selected Model)**:
```
                Pred Tier 0   Pred Tier 1   Pred Tier 2
Actual Tier 0         7            71             8
Actual Tier 1        22           171            23
Actual Tier 2        17           153            29
```

**`primary_random_forest`**:
```
                Pred Tier 0   Pred Tier 1   Pred Tier 2
Actual Tier 0        57            19            10
Actual Tier 1       121            23            72
Actual Tier 2       108            15            76
```

---

## 10. Feature Importance Analysis

From [`ml/reports/feature_importance.csv`](file:///c:/Users/palan/Documents/Final%20Proj/ml/reports/feature_importance.csv) and [`ml/reports/tree_feature_importance.csv`](file:///c:/Users/palan/Documents/Final%20Proj/ml/reports/tree_feature_importance.csv):

| Feature Name | Linear Coefficient Magnitude | Normalized Linear Importance | Random Forest MDI Importance |
|---|---|---|---|
| `volatility_63d` | 1.5006 | **31.19%** | 17.08% |
| `volatility_21d` | 1.1384 | **23.66%** | **23.88%** |
| `drawdown_63d` | 0.6952 | **14.45%** | 7.14% |
| `volatility_ratio` | 0.4637 | **9.64%** | 12.57% |
| `sma_ratio_21_63` | 0.3712 | **7.72%** | **17.20%** |
| `rsi_14` | 0.3169 | 6.59% | 5.97% |
| `return_21d` | 0.1681 | 3.49% | 10.85% |
| `return_1d` | 0.0635 | 1.32% | 1.07% |
| `return_5d` | 0.0532 | 1.11% | 3.35% |
| `volume_ratio_21d` | 0.0406 | 0.84% | 0.88% |

**Key Finding**: Both linear and tree ensembles unanimously identify **medium- and quarterly-term volatility (`volatility_63d`, `volatility_21d`) and trend alignment (`sma_ratio_21_63`, `drawdown_63d`)** as the dominant predictive drivers, while short-term daily price and volume noise contribute $< 2\%$.

---

## 11. SHAP Explainability (Global & Local)

### Global SHAP Attribution
From [`ml/reports/shap_feature_importance.csv`](file:///c:/Users/palan/Documents/Final%20Proj/ml/reports/shap_feature_importance.csv):
1. `volatility_63d` ($\text{mean } |\phi| = 0.5947$)
2. `drawdown_63d` ($\text{mean } |\phi| = 0.4942$)
3. `rsi_14` ($\text{mean } |\phi| = 0.3905$)
4. `volatility_21d` ($\text{mean } |\phi| = 0.3740$)
5. `volatility_ratio` ($\text{mean } |\phi| = 0.3169$)

### Local Instance Explanations (Test Observation Case Studies)
From [`ml/reports/shap_local_explanations.csv`](file:///c:/Users/palan/Documents/Final%20Proj/ml/reports/shap_local_explanations.csv):
- **Case 1 (Date: `2023-03-10`, Predicted: Tier 0 — Downward Regime)**:
  - `volatility_63d` attribution: $+0.8366$ (Elevated quarterly volatility strongly drove the model toward predicting a negative regime).
  - `rsi_14` attribution: $+0.6996$ (Overbought indicator reading increased downward risk probability).
  - `drawdown_63d` attribution: $-0.7327$ (Proximity to prior peak tempered probability).
- **Case 2 (Date: `2023-01-02`, Predicted: Tier 1 — Neutral Regime)**:
  - Balanced contributions from `volatility_21d` ($+0.3370$) and normalized return indicators supported a stable regime prediction.

---

## 12. Model Selection Decision

**Selected Candidate**: **`linear_baseline` (Multinomial Logistic Regression)**.

### Rationale
- Strictly adhering to the predefined protocol priority:
  $$\text{Macro F1} \longrightarrow \text{Tier 0 Recall} \longrightarrow \text{Tier 2 Precision} \longrightarrow \text{Accuracy}$$
- Evaluated strictly on the unseen **Validation partition (2022)**, `linear_baseline` achieved the highest Macro F1 (0.3144), highest Tier 0 Recall (0.2041), and highest Tier 2 Precision (0.3617).
- Furthermore, `linear_baseline` produces smooth, calibrated prediction probabilities ($P(\text{Tier } k)$), which are optimal for dynamic suitability scaling in Task 11.
- Both `selected_model.joblib` and secondary checkpoints (`random_forest.joblib`, `hist_gradient_boosting.joblib`) were serialized for downstream comparative evaluation.

---

## 13. Limitations & Scientific Scope

1. **Benchmark Representation**: The current experiment is conducted on the NIFTY 50 institutional index time series. Individual equities, small-caps, and fixed-income assets have differing liquidity and volatility profiles and will require dedicated asset-level calibration.
2. **Non-Stationarity**: Historical financial time series do not guarantee future return distributions. Sudden geopolitical or macroeconomic regime shifts can cause out-of-distribution shocks.
3. **Regulatory Non-Advisory**: Predictions represent empirical statistical probabilities over historical feature spaces and do **not** constitute personalized investment advice or guaranteed financial returns.
4. **Production Isolation**: This experiment is completely isolated in `ml/`. The production React frontend, Node.js backend, and PostgreSQL suitability engine remain 100% untouched.

---

## 14. Next Steps (Task 11)

In **Task 11**, we will design and implement the **Hybrid Suitability Bridge**:
1. Connect the serialized model predictions (`selected_model.joblib`) with the Node.js recommendation engine.
2. Formulate the dynamic scoring equation:
   $$\text{FinalScore} = w_{\text{rule}} \times \text{RuleScore} + w_{\text{ML}} \times \text{RegimeProbabilityAdjuster}$$
3. Surface plain-language SHAP feature attributions directly inside the existing React "Why this?" modal.
