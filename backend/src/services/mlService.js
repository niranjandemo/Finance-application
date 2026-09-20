import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_DIR = path.resolve(__dirname, "../../..");

// Configuration Constants
export const ML_CONFIG = {
  SERVICE_URL: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
  MAX_ADJUSTMENT_POINTS: 5, // Maximum +/- 5 points out of 100
  TIMEOUT_MS: 2500,
};

/**
 * Fetches latest market-context regime prediction from the Python ML layer.
 * Attempts HTTP request to FastAPI microservice first; falls back gracefully
 * to executing python -m ml.src.predict via child_process if service is not running.
 */
export const getMarketRegimePrediction = async () => {
  // Strategy 1: Try FastAPI HTTP service
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_CONFIG.TIMEOUT_MS);

    const response = await fetch(`${ML_CONFIG.SERVICE_URL}/predict/latest`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return formatPredictionResponse(data);
    }
  } catch (httpError) {
    // HTTP service unavailable or timed out; proceed to local subprocess fallback
  }

  // Strategy 2: Direct Python Subprocess Fallback
  return new Promise((resolve) => {
    execFile(
      "python",
      ["-m", "ml.src.predict"],
      { cwd: WORKSPACE_DIR, timeout: 5000 },
      (error, stdout) => {
        if (error || !stdout) {
          // Graceful degradation: Recommendations proceed using base suitability
          return resolve({
            available: false,
            reason: "ML prediction service unavailable",
            isLive: false,
          });
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(formatPredictionResponse(parsed));
        } catch (parseError) {
          resolve({
            available: false,
            reason: "Failed to parse ML output",
            isLive: false,
          });
        }
      }
    );
  });
};

/**
 * Normalizes ML output into a standard format matching Task 11 specifications.
 */
const formatPredictionResponse = (raw) => {
  const probs = raw.probabilities || {};
  return {
    available: true,
    model: raw.model || "linear_baseline",
    predictedRegime: raw.predicted_regime ?? 1,
    regimeName: raw.regime_name || "Neutral / Stable",
    probabilities: {
      tier0: probs.tier_0 ?? probs["Drawdown Risk / Underperforming"] ?? 0.33,
      tier1: probs.tier_1 ?? probs["Neutral / Stable"] ?? 0.34,
      tier2: probs.tier_2 ?? probs["Favorable / Outperforming"] ?? 0.33,
    },
    dataSource: raw.data_source || "Historical NIFTY 50 Benchmark Dataset (2015-2024)",
    benchmarkDate: raw.benchmark_date || null,
    isLive: false,
    generatedAt: new Date().toISOString(),
  };
};

/**
 * Computes deterministic hybrid suitability score by combining base rule-based suitability
 * with the bounded ML market-context signal.
 *
 * Formula:
 *   mlSignal = P(Tier 2) - P(Tier 0)  [-1.0 to +1.0]
 *   mlAdjustment = Math.round(MAX_ADJUSTMENT * mlSignal * assetSensitivity)
 *   hybridSuitability = clamp(baseSuitability + mlAdjustment, 0, 100)
 */
export const calculateHybridSuitability = (
  baseSuitability,
  mlPrediction,
  investmentCategory = "Equities",
  investmentRisk = "Moderate"
) => {
  const base = Number(baseSuitability) || 0;

  if (!mlPrediction || !mlPrediction.available) {
    return {
      baseSuitability: base,
      mlAdjustment: 0,
      hybridSuitability: base,
      match: getSuitabilityMatchString(base),
    };
  }

  const p0 = mlPrediction.probabilities?.tier0 ?? 0.33;
  const p2 = mlPrediction.probabilities?.tier2 ?? 0.33;
  const mlSignal = p2 - p0; // Positive when market momentum is favorable, negative during downward risk

  // Category sensitivity:
  // Growth equities benefit from upward regimes and suffer from drawdown regimes
  // Bonds/Fixed income/Gold act as hedges and receive a defensive boost during downward regimes
  let sensitivity = 1.0;
  const cat = (investmentCategory || "").toLowerCase();
  const risk = (investmentRisk || "").toLowerCase();

  if (cat.includes("bond") || cat.includes("fixed") || cat.includes("debt")) {
    sensitivity = -0.5; // Counter-cyclical hedge
  } else if (cat.includes("gold") || cat.includes("metal")) {
    sensitivity = -0.3; // Inflation / safe-haven hedge
  } else if (risk.includes("aggressive") || risk.includes("high")) {
    sensitivity = 1.2;
  } else if (risk.includes("conservative") || risk.includes("low")) {
    sensitivity = 0.5;
  }

  const rawAdjustment = Math.round(ML_CONFIG.MAX_ADJUSTMENT_POINTS * mlSignal * sensitivity);
  const boundedAdjustment = Math.max(
    -ML_CONFIG.MAX_ADJUSTMENT_POINTS,
    Math.min(ML_CONFIG.MAX_ADJUSTMENT_POINTS, rawAdjustment)
  );

  const hybrid = Math.max(0, Math.min(100, base + boundedAdjustment));

  return {
    baseSuitability: base,
    mlAdjustment: boundedAdjustment,
    hybridSuitability: hybrid,
    match: getSuitabilityMatchString(hybrid),
  };
};

const getSuitabilityMatchString = (score) => {
  if (score >= 85) return "HIGH";
  if (score >= 70) return "GOOD";
  if (score >= 50) return "MODERATE";
  return "FAIR";
};
