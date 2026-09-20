"""
Preprocessing and Chronological Split Module for X-PISA Experiment
Ensures zero data leakage through strict time-series ordering and
isolated scaler fitting.
"""

from typing import Tuple, Dict
import pandas as pd
from sklearn.preprocessing import StandardScaler
from .features import FEATURE_COLUMNS, TARGET_COLUMN


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans dataset by dropping rows where features (initial rolling window)
    or target (final forward window) are undefined.
    """
    cols_to_check = FEATURE_COLUMNS + [TARGET_COLUMN]
    cleaned = df.dropna(subset=cols_to_check).copy()
    cleaned[TARGET_COLUMN] = cleaned[TARGET_COLUMN].astype(int)
    return cleaned.reset_index(drop=True)


def chronological_split(
    df: pd.DataFrame,
    train_end_date: str = "2021-12-31",
    val_end_date: str = "2022-12-31",
    purge_window: int = 21,
) -> Dict[str, pd.DataFrame]:
    """
    Splits time-series dataset into chronological Train, Validation, and Test partitions.
    Guarantees no future observations leak into earlier training windows.
    
    If purge_window > 0, an embargo of `purge_window` trading sessions is removed from
    the end of the Train and Validation partitions to ensure that 21-day forward target
    evaluation horizons do not overlap across partition boundaries.
    """
    if "Date" not in df.columns:
        raise ValueError("DataFrame must contain a 'Date' column for chronological splitting.")

    df_sorted = df.sort_values("Date").reset_index(drop=True)

    train_df = df_sorted[df_sorted["Date"] <= train_end_date].copy().reset_index(drop=True)
    val_df = df_sorted[(df_sorted["Date"] > train_end_date) & (df_sorted["Date"] <= val_end_date)].copy().reset_index(drop=True)
    test_df = df_sorted[df_sorted["Date"] > val_end_date].copy().reset_index(drop=True)

    if purge_window > 0:
        if len(train_df) > purge_window:
            train_df = train_df.iloc[:-purge_window].reset_index(drop=True)
        if len(val_df) > purge_window:
            val_df = val_df.iloc[:-purge_window].reset_index(drop=True)

    splits = {
        "train": train_df,
        "val": val_df,
        "test": test_df,
    }

    return splits


def scale_features(
    splits: Dict[str, pd.DataFrame]
) -> Tuple[Dict[str, pd.DataFrame], StandardScaler]:
    """
    Scales features using StandardScaler fitted EXCLUSIVELY on the training partition.
    Validation and test partitions are transformed using the training scaler parameters,
    strictly preventing distribution leakage.
    """
    scaler = StandardScaler()

    # Fit scaler ONLY on train features
    train_features = splits["train"][FEATURE_COLUMNS]
    scaler.fit(train_features)

    scaled_splits = {}
    for key, partition in splits.items():
        scaled_partition = partition.copy()
        scaled_partition[FEATURE_COLUMNS] = scaler.transform(partition[FEATURE_COLUMNS])
        scaled_splits[key] = scaled_partition

    return scaled_splits, scaler
