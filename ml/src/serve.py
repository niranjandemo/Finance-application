"""
FastAPI Microservice for X-PISA Machine Learning Predictions
Provides production HTTP endpoints for single feature vector prediction
and latest historical benchmark market-context prediction.
"""

from typing import Dict, Optional
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .predict import predict_from_features, predict_latest_benchmark, load_artifacts
from .features import FEATURE_COLUMNS, TARGET_NAMES

app = FastAPI(
    title="X-PISA Machine Learning Prediction Service",
    description="Provides market performance regime predictions for InvestAI hybrid suitability.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FeatureInput(BaseModel):
    return_1d: float = Field(..., description="1-day price return")
    return_5d: float = Field(..., description="5-day cumulative return")
    return_21d: float = Field(..., description="21-day cumulative return")
    volatility_21d: float = Field(..., description="21-day annualized realized volatility")
    volatility_63d: float = Field(..., description="63-day annualized realized volatility")
    volatility_ratio: float = Field(..., description="Ratio of 21d to 63d volatility")
    sma_ratio_21_63: float = Field(..., description="Ratio of 21d SMA to 63d SMA")
    rsi_14: float = Field(..., description="14-day Wilder's RSI [0-100]")
    drawdown_63d: float = Field(..., description="Trailing 63-day maximum drawdown")
    volume_ratio_21d: float = Field(..., description="Current volume to 21-day average volume")


# Pre-load model and scaler on startup
try:
    model, scaler = load_artifacts()
except Exception as e:
    model, scaler = None, None
    print(f"Warning: Failed to pre-load artifacts: {e}")


@app.get("/health")
def health_check():
    """
    Health check and model status endpoint.
    """
    return {
        "status": "healthy" if model is not None else "degraded",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "model_name": type(model).__name__ if model else None,
        "features": FEATURE_COLUMNS,
    }


@app.post("/predict")
def predict_endpoint(input_data: FeatureInput):
    """
    Predicts forward 21-day performance regime from custom input feature vector.
    """
    try:
        features_dict = input_data.model_dump()
        result = predict_from_features(features_dict, model=model, scaler=scaler)
        return {
            "success": True,
            **result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/predict/latest")
def predict_latest_endpoint():
    """
    Returns the market regime prediction from the latest verified historical benchmark data.
    """
    try:
        result = predict_latest_benchmark(model_path=None, scaler_path=None)
        return {
            "success": True,
            **result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def start():
    """
    Service entry point.
    """
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")


if __name__ == "__main__":
    start()
