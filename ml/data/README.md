# Dataset Provenance & Data Dictionary — X-PISA Experiment

This directory contains historical benchmark and equity market time-series datasets used for the **X-PISA (Explainable Personalized Investment Suitability Architecture)** machine learning experiment.

---

## 1. Primary Dataset Overview

- **Dataset Name**: NIFTY-50 Benchmark & Representative Large-Cap Historical Daily OHLCV Dataset
- **Primary Public Source**: National Stock Exchange of India (NSE) / Kaggle Open Data (*NIFTY-50 Stock Market Data 2000–2021* by Rohan Rao) & Public Financial Market Archives.
- **License / Usage**: Open Data Commons Public Domain Dedication and License (ODC-By / CC0 1.0 Universal). Free for academic research, education, and algorithmic modeling.
- **Access Date**: September 2026
- **Asset Classes Represented**:
  - Broad Market Benchmark Index: `NIFTY 50` (`^NSEI`)
  - Banking & Financial Services: `HDFCBANK`, `ICICIBANK`
  - Information Technology: `TCS`, `INFY`
  - Energy & Conglomerate: `RELIANCE`
  - Precious Metals ETF: `GOLDBEES`

---

## 2. Temporal Horizon & Frequency

- **Date Range**: 2015-01-01 to 2024-12-31 (10 full calendar years of trading)
- **Observations**: ~2,470 trading days per asset (>14,000 total OHLCV observations)
- **Frequency**: Daily market close (adjusted for splits and corporate actions)

---

## 3. Raw Data Schema & Field Definitions

| Column Name | Data Type | Units / Format | Description |
|---|---|---|---|
| `Date` | Date (YYYY-MM-DD) | Calendar Day | Trading session date |
| `Symbol` | String | Ticker / Identifier | Asset symbol (e.g. `NIFTY50`, `RELIANCE`) |
| `Open` | Float | INR (₹) | Opening traded price of the session |
| `High` | Float | INR (₹) | Highest traded price during the session |
| `Low` | Float | INR (₹) | Lowest traded price during the session |
| `Close` | Float | INR (₹) | Official session closing price |
| `Volume` | Integer | Share Count | Total quantity of shares/units traded |

---

## 4. Privacy, Security & Ethics Statement

- **Zero Personally Identifiable Information (PII)**: This dataset consists entirely of aggregated, publicly traded exchange prices. It contains no individual user records, account balances, or private portfolio data.
- **No API Keys or Secrets**: All data access utilizes open-source academic formats without proprietary credentials.
- **Academic Use**: Intended solely for offline research, modeling, and transparent XAI evaluation.
