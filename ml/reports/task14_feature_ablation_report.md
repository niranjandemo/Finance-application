# Task 14 — Feature Importance and Ablation Study Report

**Project**: InvestAI / X-PISA  
**Module**: Machine Learning Prediction & Risk Regime Classification  
**Model Architecture**: Multinomial Logistic Regression ($C=1.0$, L-BFGS, `random_state=42`)  
**Evaluation Split**: Chronological Time-Series with 21-Day Embargo Purge  
  - **Train**: 2015-03-31 to 2021-12-02 (1,665 observations)
  - **Validation**: 2022-01-03 to 2022-12-01 (239 observations)
  - **Test (Out-of-Sample Benchmark)**: 2023-01-02 to 2024-12-02 (501 observations)

---

## 1. Baseline Features

The baseline feature space consists of **10 causal technical market indicators** calculated strictly from historical daily OHLCV data up to time $t$:

| # | Feature Name | Domain | Formula / Definition |
| :---: | :--- | :--- | :--- |
| 1 | `return_1d` | Momentum | 1-day percentage price change |
| 2 | `return_5d` | Momentum | 5-day percentage price change |
| 3 | `return_21d` | Momentum | 21-day percentage price change (1 trading month) |
| 4 | `volatility_21d` | Volatility | 21-day annualized standard deviation of daily returns |
| 5 | `volatility_63d` | Volatility | 63-day annualized standard deviation of daily returns |
| 6 | `volatility_ratio` | Volatility | Ratio of short-term to medium-term volatility (`volatility_21d / volatility_63d`) |
| 7 | `sma_ratio_21_63` | Trend | Ratio of 21-day SMA to 63-day SMA (trend convergence/divergence) |
| 8 | `rsi_14` | Oscillator | Standard 14-day Wilder Relative Strength Index (0 to 100) |
| 9 | `drawdown_63d` | Risk / Drawdown | Maximum drawdown over trailing 63 trading days |
| 10 | `volume_ratio_21d` | Liquidity / Volume | Daily volume relative to 21-day rolling volume mean |

---

## 2. Baseline Model Performance

The baseline model (Experiment A) was evaluated under chronological time-series splitting with strict 21-day embargo purge:

| Metric | Validation (2022) | Test Set Benchmark (2023-2024) |
| :--- | :---: | :---: |
| **Accuracy** | 0.3138 | 0.4132 |
| **Macro F1** | 0.3144 | 0.2966 |
| **Balanced Accuracy** | 0.3183 | 0.3396 |
| **Tier 0 Recall (Drawdown Risk)** | 0.2041 | 0.0814 |
| **Tier 2 Precision (Favorable Momentum)** | 0.3617 | 0.4833 |

> [!NOTE]
> In accordance with anti-leakage principles, the test set was **not** used for model selection or feature selection. Validation metrics represent the objective criteria for ablation comparison.

---

## 3. Feature Importance Ranking

Feature importance was evaluated across three distinct interpretability paradigms:
1. **Model Coefficient Magnitude**: Mean absolute normalized weight across the 3 multinomial logistic regression hyperplanes.
2. **Permutation Importance**: Mean reduction in validation macro-F1 over 15 random shuffles.
3. **SHAP (LinearExplainer)**: Mean absolute Shapley attribution values across sample observations.

| Rank | Feature | Linear Coef Magnitude | Normalized Share | Permutation Mean $\Delta$ F1 | Mean Abs SHAP | Primary Signal Domain |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | `volatility_63d` | 1.5006 | 31.2% | -0.2124 | 0.5947 | Volatility |
| 2 | `volatility_21d` | 1.1384 | 23.7% | +0.0805 | 0.3740 | Volatility |
| 3 | `drawdown_63d` | 0.6952 | 14.4% | -0.0120 | 0.4942 | Risk / Drawdown |
| 4 | `volatility_ratio` | 0.4637 | 9.6% | -0.0423 | 0.3169 | Volatility |
| 5 | `sma_ratio_21_63` | 0.3712 | 7.7% | -0.0336 | 0.2954 | Trend |
| 6 | `rsi_14` | 0.3169 | 6.6% | +0.0058 | 0.3905 | Oscillator |
| 7 | `return_21d` | 0.1681 | 3.5% | -0.0154 | 0.2282 | Momentum |
| 8 | `return_1d` | 0.0635 | 1.3% | +0.0015 | 0.0548 | Momentum |
| 9 | `return_5d` | 0.0532 | 1.1% | -0.0063 | 0.0496 | Momentum |
| 10 | `volume_ratio_21d` | 0.0406 | 0.8% | -0.0175 | 0.0365 | Volume |

### Most Influential Features Summary
- **Top Drivers**: `volatility_63d`, `volatility_21d`, and `drawdown_63d` together account for over **69%** of the model's total linear attribution weight. Volatility regimes and trailing drawdowns dominate market state classification.
- **Secondary Stabilizers**: `volatility_ratio`, `sma_ratio_21_63`, and `rsi_14` provide non-linear confirmation of regime shifts.
- **Least Influential**: `return_1d`, `return_5d`, and `volume_ratio_21d` each contribute under **1.5%** of linear weight, indicating relatively small attribution weights for 21-day forward regime predictions under the linear model.

---

## 4. Ablation Experiment Results

Below is the complete results matrix for Experiments A through F:

| Experiment | Description | Feats | Val Acc | Val Macro F1 | Val Bal Acc | Val T0 Recall | Val T2 Prec | Test Acc | Test Macro F1 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Exp_A** | Baseline: All 10 Features | 10 | 0.3138 | 0.3144 | 0.3183 | 0.2041 | 0.3617 | 0.4132 | 0.2966 |
| **Exp_B** | Remove Return/Momentum | 7 | 0.3180 | 0.3142 | 0.3258 | 0.1735 | 0.3600 | 0.4172 | 0.2878 |
| **Exp_C** | Remove Volatility | 7 | 0.3013 | 0.2688 | 0.3054 | 0.0918 | 0.1414 | 0.4431 | 0.2759 |
| **Exp_D** | Remove RSI | 9 | 0.3347 | 0.3366 | 0.3457 | 0.1735 | 0.4444 | 0.4052 | 0.2625 |
| **Exp_E** | Remove Volume | 9 | 0.3389 | 0.3360 | 0.3433 | 0.2143 | 0.3750 | 0.4172 | 0.3016 |
| **Exp_F** | Justified Core Subset | 7 | 0.2929 | 0.2908 | 0.2987 | 0.1633 | 0.3636 | 0.4212 | 0.2638 |

---

## 5. Comparison of Experiments

Detailed comparative analysis against the 10-feature baseline:

### Experiment B (Remove Return/Momentum)
- **Features Removed**: `return_1d;return_5d;return_21d` (7 features remaining)
- **Validation Changes vs Baseline**: Macro F1: -0.02% (0.3144 → 0.3142) | Accuracy: +0.42% | T0 Recall: -3.06% | T2 Precision: -0.17%
- **Behavioral Impact**: Metric performance was virtually unchanged on validation Macro F1, indicating limited incremental contribution from those features under the current experimental configuration.

### Experiment C (Remove Volatility)
- **Features Removed**: `volatility_21d;volatility_63d;volatility_ratio` (7 features remaining)
- **Validation Changes vs Baseline**: Macro F1: -4.56% (0.3144 → 0.2688) | Accuracy: -1.25% | T0 Recall: -11.23% (0.2041 → 0.0918) | T2 Precision: -22.03% (0.3617 → 0.1414)
- **Behavioral Impact**: Noticeable degradation observed. Provides clear evidence that volatility-related features contribute substantially to the current model.

### Experiment D (Remove RSI)
- **Features Removed**: `rsi_14` (9 features remaining)
- **Validation Changes vs Baseline**: Macro F1: +2.22% | Accuracy: +2.09% | T0 Recall: -3.06% | T2 Precision: +8.27%
- **Behavioral Impact**: While validation metrics showed a slight increase, out-of-sample test Macro F1 declined (0.2966 → 0.2625), indicating that RSI contributes positively to generalization.

### Experiment E (Remove Volume)
- **Features Removed**: `volume_ratio_21d` (9 features remaining)
- **Validation Changes vs Baseline**: Macro F1: +2.16% (0.3144 → 0.3360) | Accuracy: +2.51% | T0 Recall: +1.02% | T2 Precision: +1.33%
- **Test Metrics vs Baseline**: Test Macro F1: +0.50% (0.2966 → 0.3016) | Test T2 Precision: +3.34% (0.4833 → 0.5167)
- **Behavioral Impact**: The ablation results indicate that `volume_ratio_21d` contributes relatively little to the current model, while its removal produced a modest improvement in the evaluated validation and test metrics.

### Experiment F (Justified Core Subset)
- **Features Removed**: `return_1d;return_5d;volume_ratio_21d` (7 features remaining)
- **Validation Changes vs Baseline**: Macro F1: -2.36% (0.3144 → 0.2908) | Accuracy: -2.09% | T0 Recall: -4.08% | T2 Precision: +0.19%
- **Test Metrics vs Baseline**: Test Macro F1: -3.28% (0.2966 → 0.2638)
- **Behavioral Impact**: The 7-feature core subset evaluated in Exp_F did not outperform the 10-feature baseline, with Macro F1 decreasing on both validation and test sets.

---

## 6. Key Findings

1. **Substantial Contribution of Volatility Features**: Volatility features (`volatility_63d`, `volatility_21d`, `volatility_ratio`) contribute substantially to the current model. Removing volatility features (Experiment C) produced a marked drop across key metrics: validation Macro F1 decreased from 0.3144 to 0.2688, Tier 0 Recall (drawdown risk detection) dropped from 0.2041 to 0.0918, and Tier 2 Precision dropped from 0.3617 to 0.1414. This provides empirical evidence that volatility-related features are important for market regime discrimination in the current architecture.
2. **Limited Incremental Contribution from Short-Term Return Features**: Removing short-term momentum lags (`return_1d`, `return_5d`, `return_21d` in Experiment B) produced almost no change in validation Macro F1 (0.3144 baseline vs. 0.3142 in Exp_B), indicating limited incremental contribution from those features under the current experimental configuration.
3. **Volume Feature Observation**: The ablation results indicate that `volume_ratio_21d` contributes relatively little to the current model, while its removal (Experiment E) produced a modest improvement in the evaluated validation metrics (Macro F1: 0.3144 → 0.3360) and test metrics (Macro F1: 0.2966 → 0.3016). Therefore, it is a candidate for further investigation in future retraining experiments. This is an experimental observation under the current dataset and model family, not proof that the feature is universally harmful or noise.
4. **RSI Significance**: Removing `rsi_14` (Experiment D) reduced out-of-sample generalization on the test set (test Macro F1: 0.2966 → 0.2625; test Tier 2 Precision: 0.4833 → 0.3256), indicating that the momentum oscillator signal aids out-of-sample consistency.
5. **Evaluated 7-Feature Core Subset (Experiment F)**: The 7-feature core subset evaluated in Exp_F did not outperform the 10-feature baseline, with Macro F1 decreasing on both validation (0.3144 → 0.2908) and test sets (0.2966 → 0.2638). Therefore, the current 10-feature production configuration is retained. `volume_ratio_21d`, `return_1d`, and `return_5d` may be considered candidates for future controlled experiments, but their removal is not established as a production improvement by the current study.
6. **Statistical Caution**: Feature importance and ablation metrics reflect empirical associations within the specific model architecture and dataset partition; they must **NOT** be interpreted as proving macroeconomic causality or universal feature relationships.

---

## 7. Recommended Feature Configuration for Future Investigation

The purpose of Task 14 was to understand feature contribution, not to automatically improve or replace the production model.

**The 10-feature production configuration is retained because the evaluated 7-feature subset did not outperform the baseline. The ablation study provides evidence for future feature-selection experiments but does not justify changing the current production model.**

### Summary of Research Insights for Future Controlled Experiments:
1. **Retain Volatility and Trend Anchors**: Volatility features (`volatility_63d`, `volatility_21d`, `volatility_ratio`), drawdown level (`drawdown_63d`), and moving average trend (`sma_ratio_21_63`) remain core pillars of the model.
2. **Candidates for Future Investigation**: In future retraining experiments, researchers may test isolated removal or refinement of `volume_ratio_21d` (which showed modest metric gains when ablated alone) and short-term price lags (`return_1d`, `return_5d`), using cross-validation and alternative model families before considering production adjustments.
3. **No Demonstrated Production Improvement for 7-Feature Subset**: Because the 7-feature subset (Exp_F) underperformed the 10-feature baseline across both validation and test partitions, it should not be adopted into production without extensive hyperparameter optimization and cross-market validation.

---

## 8. Confirmation of Production Safety

The 10-feature production configuration is retained because the evaluated 7-feature subset did not outperform the baseline. The ablation study provides evidence for future feature-selection experiments but does not justify changing the current production model.

Strict production safeguards were maintained throughout this experiment:
- [x] **Production model artifact untouched**: `ml/models/selected_model.joblib` retains the 10-feature linear baseline (3 × 10 coefficient matrix).
- [x] **Production scaler artifact untouched**: `ml/models/scaler.joblib` retains the 10-feature `StandardScaler` (`n_features_in_ = 10`).
- [x] **Production metadata preserved**: `ml/models/model_metadata.json` remains strictly on the 10 baseline features matching `FEATURE_COLUMNS`.
- [x] **FastAPI endpoint untouched**: `ml/src/serve.py` and `ml/src/predict.py` serve the 10-feature baseline.
- [x] **Node.js integration untouched**: `backend/src/services/mlClient.js` and `backend/src/services/recommendationService.js` remain intact.
- [x] **Suitability bounds preserved**: ML signal integration retains the $\pm 5$ percentage-point suitability limit.
- [x] **Zero future leakage**: 21-day embargo purge strictly separated training from evaluation partitions.
- [x] **No test-set tuning**: The test set was held strictly out-of-sample and not used for selection.

---

## 9. Regression Test Results

All prior module verifications were executed to confirm system integrity:
- **Task 9 Verification (`verify_task9_setup.py`)**: `[PASS]` (Dataset integrity, feature definitions, target horizon).
- **Task 10 Verification (`verify_task10.py`)**: `[PASS]` (20/20 checks passed, artifact integrity, model training).
- **Task 11 Verification (`verify_task11.py`)**: `[PASS]` (19/19 checks passed, live FastAPI ML service, Node.js hybrid suitability).
- **Task 14 Verification (`verify_task14.py`)**: `[PASS]` (Ablation results CSV, feature importance ranking, report generation).