"""
Feature Engineering Module for X-PISA Experiment
Calculates technical market features strictly up to time t,
and defines the forward target variable for supervised training.
"""

import numpy as np
import pandas as pd


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """
    Computes standard Wilder's Relative Strength Index (RSI).
    """
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()

    rs = avg_gain / (avg_loss + 1e-9)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return rsi


def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes causal technical features from historical OHLCV data strictly up to time t.
    Zero future information is utilized in this function.
    """
    out = df.copy()

    # 1. Price Momentum / Returns
    out["return_1d"] = out["Close"].pct_change(1)
    out["return_5d"] = out["Close"].pct_change(5)
    out["return_21d"] = out["Close"].pct_change(21)

    # 2. Realized Volatility (Annualized using 252 trading days)
    out["volatility_21d"] = out["return_1d"].rolling(window=21).std() * np.sqrt(252)
    out["volatility_63d"] = out["return_1d"].rolling(window=63).std() * np.sqrt(252)
    out["volatility_ratio"] = out["volatility_21d"] / (out["volatility_63d"] + 1e-6)

    # 3. Moving Average Trend Convergence
    out["sma_21"] = out["Close"].rolling(window=21).mean()
    out["sma_63"] = out["Close"].rolling(window=63).mean()
    out["sma_ratio_21_63"] = out["sma_21"] / (out["sma_63"] + 1e-6)

    # 4. Momentum Oscillators
    out["rsi_14"] = compute_rsi(out["Close"], period=14)

    # 5. Trailing Maximum Drawdown (over trailing 63 trading days)
    rolling_max_63 = out["High"].rolling(window=63, min_periods=21).max()
    out["drawdown_63d"] = (out["Close"] - rolling_max_63) / (rolling_max_63 + 1e-6)

    # 6. Volume Dynamics
    rolling_vol_21 = out["Volume"].rolling(window=21, min_periods=5).mean()
    out["volume_ratio_21d"] = out["Volume"] / (rolling_vol_21 + 1e-6)

    return out


def compute_target(df: pd.DataFrame, horizon: int = 21) -> pd.DataFrame:
    """
    Computes the forward performance regime target.
    
    Target:
      0: Underperforming / Drawdown Risk (Forward return < -2%)
      1: Neutral / Benchmark Stable (-2% <= Forward return <= +3%)
      2: Favorable / Outperforming (Forward return > +3%)
      
    NOTE: The target looks forward H periods. Rows at the tail of the dataset
    (last H rows) will have NaN targets and must be dropped during training.
    """
    out = df.copy()

    # Forward return over H trading days
    out["forward_return_21d"] = (out["Close"].shift(-horizon) - out["Close"]) / out["Close"]

    # Discretize into 3 performance regimes
    conditions = [
        out["forward_return_21d"] < -0.02,
        (out["forward_return_21d"] >= -0.02) & (out["forward_return_21d"] <= 0.03),
        out["forward_return_21d"] > 0.03,
    ]
    choices = [0, 1, 2]

    out["target_regime"] = np.select(conditions, choices, default=np.nan)
    return out


FEATURE_COLUMNS = [
    "return_1d",
    "return_5d",
    "return_21d",
    "volatility_21d",
    "volatility_63d",
    "volatility_ratio",
    "sma_ratio_21_63",
    "rsi_14",
    "drawdown_63d",
    "volume_ratio_21d",
]

TARGET_COLUMN = "target_regime"

TARGET_NAMES = {
    0: "Drawdown Risk / Underperforming",
    1: "Neutral / Stable",
    2: "Favorable / Outperforming",
}
