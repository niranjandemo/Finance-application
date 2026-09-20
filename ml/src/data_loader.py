"""
Data Loader Module for X-PISA Experiment
Loads and validates historical benchmark market time series.
"""

import os
from typing import Optional, List, Dict
import pandas as pd


def load_asset_csv(filepath: str) -> pd.DataFrame:
    """
    Loads an individual asset OHLCV CSV file, standardizes column names,
    and sorts chronologically by date.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Asset data file not found: {filepath}")

    df = pd.read_csv(filepath)
    df.columns = [col.strip().title() for col in df.columns]

    if "Date" not in df.columns:
        raise ValueError(f"Missing required 'Date' column in {filepath}")

    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date").reset_index(drop=True)

    # Validate required OHLCV columns
    required = ["Open", "High", "Low", "Close", "Volume"]
    for req in required:
        if req not in df.columns:
            raise ValueError(f"Missing required column '{req}' in {filepath}")

    return df


def load_multi_asset_dataset(data_dir: str) -> Dict[str, pd.DataFrame]:
    """
    Loads all available asset CSVs from a directory and returns a dictionary
    keyed by asset symbol.
    """
    assets = {}
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
        return assets

    for fname in os.listdir(data_dir):
        if fname.endswith(".csv"):
            symbol = os.path.splitext(fname)[0].upper()
            fpath = os.path.join(data_dir, fname)
            assets[symbol] = load_asset_csv(fpath)

    return assets
