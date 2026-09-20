# Data Quality & Exploratory Analysis Report — X-PISA Experiment

**Generated for Task 9: Define and Prepare the X-PISA AI/ML Experiment**
**Date**: 2026-09-17 22:09:53

---

## 1. Raw Dataset Profile

- **Source File**: `ml/data/raw/nifty50_daily_2015_2024.csv`
- **Total Raw Observations**: 2,609
- **Total Columns**: 7 (Date, Symbol, Open, High, Low, Close, Volume)
- **Temporal Coverage**: 2015-01-01 to 2024-12-31 (10 calendar years)
- **Temporal Frequency**: Daily exchange trading sessions (excluding weekends & exchange holidays)
- **Chronological Ordering**: Confirmed Monotonic Increasing
- **Duplicate Date Stamps**: 0
- **Missing Raw Values**: {'Date': 0, 'Symbol': 0, 'Open': 0, 'High': 0, 'Low': 0, 'Close': 0, 'Volume': 0}

---

## 2. Feature Engineering & Boundary Analysis

- **Initial Rolling Window Truncation**: 63 trading days (required for trailing 63-day volatility and drawdown baseline).
- **Final Horizon Truncation**: 21 trading days (required for forward 21-day performance evaluation).
- **Usable Clean Observations**: 2,525
- **Input Features Computed**: 10
  1. `return_1d` (Daily return)
  2. `return_5d` (Weekly momentum)
  3. `return_21d` (Monthly trend)
  4. `volatility_21d` (21-day annualized realized volatility)
  5. `volatility_63d` (63-day annualized realized volatility)
  6. `volatility_ratio` (Volatility acceleration ratio)
  7. `sma_ratio_21_63` (Moving average convergence ratio)
  8. `rsi_14` (Relative Strength Index)
  9. `drawdown_63d` (Trailing 3-month drawdown depth)
  10. `volume_ratio_21d` (Trading volume momentum)

---

## 3. Target Distribution (`target_regime`)

| Class ID | Performance Regime | Threshold Criteria | Count | Percentage |
|---|---|---|---|---|
| **0** | Drawdown Risk / Underperforming | Return < -2.0% | 663 | 26.26% |
| **1** | Neutral / Stable | -2.0% <= Return <= +3.0% | 1012 | 40.08% |
| **2** | Favorable / Outperforming | Return > +3.0% | 850 | 33.66% |

*Note: The distribution demonstrates balanced representation across all three economic regimes, avoiding pathological severe class imbalance.*

---

## 4. Chronological Partitioning (Zero-Leakage Walk-Forward Split)

| Split Partition | Calendar Window | Observations | Share (%) | Purpose |
|---|---|---|---|---|
| **Train** | 2015-01-01 to 2021-12-31 | 1,764 | 69.9% | Model parameter estimation |
| **Validation** | 2022-01-01 to 2022-12-31 | 260 | 10.3% | Hyperparameter tuning & threshold selection |
| **Test (Out-of-Sample)** | 2023-01-01 to 2024-12-31 | 501 | 19.8% | Final unbiased empirical evaluation |

---

## 5. Data Hygiene Decisions

1. **Strict Causal Filtering**: All 10 technical features are computed strictly using historical price and volume data up to date $t$.
2. **StandardScaler Preprocessing**: Fitted strictly on the Training partition; test and validation partitions are transformed using training scale parameters to prevent distribution leakage.
3. **No Imputation of Target**: Any dates where forward 21-day returns cannot be observed (the tail of the dataset) are excluded from training rather than artificially imputed.
