import pool from "../config/db.js";

/**
 * Investment Model
 *
 * Provides database queries for the investment catalog and a transparent,
 * reproducible rule-based suitability algorithm.
 *
 * NOTE: This is an explicit rule-based calculation. It is NOT a machine-learning
 * or AI prediction.
 */

export const getAllInvestments = async () => {
  const result = await pool.query(
    `SELECT
      id,
      name,
      category,
      risk_level,
      target_horizon,
      expected_return,
      minimum_investment,
      description,
      created_at,
      updated_at
     FROM investments
     ORDER BY id ASC`
  );

  return result.rows;
};

export const getInvestmentById = async (id) => {
  const result = await pool.query(
    `SELECT
      id,
      name,
      category,
      risk_level,
      target_horizon,
      expected_return,
      minimum_investment,
      description,
      created_at,
      updated_at
     FROM investments
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

/**
 * Calculates a transparent, rule-based suitability score between an investment
 * option and the authenticated user's risk assessment and profile data.
 *
 * Formula components (total maximum 100, clamped between 30 and 98):
 * 1. Risk Alignment (up to 60 pts):
 *    - Maps option risk level to ideal risk center:
 *      Low -> 25, Low-Moderate -> 40, Moderate -> 60, Moderate-High -> 75, High -> 90.
 *    - Deducts 0.6 pts per point difference between user risk score and target risk center.
 *    - Minimum floor of 15 pts.
 * 2. Horizon Compatibility (up to 30 pts):
 *    - Exact horizon match: +30 pts
 *    - Adjacent horizon (e.g. medium with short/long): +20 pts
 *    - Distant horizon (short with long): +10 pts
 *    - Default if unset: +15 pts
 * 3. Experience & Profile Alignment (up to 10 pts):
 *    - Beginners matching Low/Moderate risk: +10 pts
 *    - Advanced users matching High/Moderate-High risk: +10 pts
 *    - Intermediate or baseline alignment: +8 pts
 */
export const calculateSuitability = (investment, userRisk, userProfile) => {
  // If user has not completed risk assessment or profile, return baseline score
  if (!userRisk && !userProfile) {
    const baselineScores = {
      "Large Cap Equity": 85,
      "Diversified Equity": 82,
      "Government Bonds": 75,
      "Equity Mutual Funds": 72,
      "Index Funds": 80,
      "Gold & Precious Metals": 70,
    };
    const score = baselineScores[investment.name] || 70;
    return {
      score,
      match: `${score}%`,
      isPersonalized: false,
    };
  }

  // 1. Risk Alignment (max 60 points)
  const riskCenters = {
    Low: 25,
    "Low-Moderate": 40,
    Moderate: 60,
    "Moderate-High": 75,
    High: 90,
  };

  const targetRisk = riskCenters[investment.risk_level] ?? 60;
  const userScore =
    userRisk && typeof userRisk.risk_score === "number"
      ? userRisk.risk_score
      : 50;

  const riskDiff = Math.abs(userScore - targetRisk);
  const riskPoints = Math.max(15, Math.round(60 - riskDiff * 0.6));

  // 2. Horizon Compatibility (max 30 points)
  const horizonOrder = { short: 1, medium: 2, long: 3 };
  const userHorizonRaw = (userProfile?.horizon || "").toLowerCase();
  let userHorizonKey = "medium";
  if (userHorizonRaw.includes("short") || userHorizonRaw.includes("<") || userHorizonRaw.includes("3")) {
    userHorizonKey = "short";
  } else if (userHorizonRaw.includes("long") || userHorizonRaw.includes("7") || userHorizonRaw.includes(">")) {
    userHorizonKey = "long";
  } else if (userHorizonRaw.includes("medium") || userHorizonRaw.includes("5")) {
    userHorizonKey = "medium";
  }

  const optionHorizonKey = (investment.target_horizon || "medium").toLowerCase();
  let horizonPoints = 15;

  if (userProfile?.horizon) {
    const diff = Math.abs(
      (horizonOrder[userHorizonKey] || 2) - (horizonOrder[optionHorizonKey] || 2)
    );
    if (diff === 0) {
      horizonPoints = 30; // Exact match
    } else if (diff === 1) {
      horizonPoints = 20; // Adjacent
    } else {
      horizonPoints = 10; // Opposite
    }
  }

  // 3. Experience & Goal Synergy (max 10 points)
  let synergyPoints = 8;
  const experience = (userProfile?.experience || "").toLowerCase();
  if (experience === "beginner" && (investment.risk_level === "Low" || investment.risk_level === "Low-Moderate")) {
    synergyPoints = 10;
  } else if (experience === "advanced" && (investment.risk_level === "High" || investment.risk_level === "Moderate-High")) {
    synergyPoints = 10;
  }

  const total = Math.min(98, Math.max(30, riskPoints + horizonPoints + synergyPoints));

  return {
    score: total,
    match: `${total}%`,
    isPersonalized: Boolean(userRisk || userProfile),
  };
};
