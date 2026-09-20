import {
  getAllInvestments,
  calculateSuitability,
} from "./investmentModel.js";
import {
  getInvestmentProfile,
  getRiskAssessment,
} from "./userModel.js";
import {
  getMarketRegimePrediction,
  calculateHybridSuitability,
} from "../services/mlService.js";

/**
 * Generates an intuitive, user-grounded rationale for why an investment
 * was recommended based on the user's risk profile and horizon.
 *
 * NOTE: This is a deterministic, rule-based explanation derived from
 * user attributes, not an LLM or ML prediction.
 */
export const generateRecommendationReason = (investment, userRisk, userProfile) => {
  const riskCategory = (userRisk?.risk_category || "moderate").toLowerCase();
  const rawHorizon = (userProfile?.horizon || "medium").toLowerCase();
  let horizonDesc = "medium";
  if (rawHorizon.includes("short") || rawHorizon.includes("<") || rawHorizon.includes("3")) {
    horizonDesc = "short-term";
  } else if (rawHorizon.includes("long") || rawHorizon.includes(">") || rawHorizon.includes("7")) {
    horizonDesc = "long-term";
  } else {
    horizonDesc = "medium-to-long";
  }

  // Specific contextual rationales based on asset category & user profile
  switch (investment.name) {
    case "Large Cap Equity":
      return `Suitable due to your ${horizonDesc} investment horizon and ${riskCategory} risk tolerance.`;
    case "Diversified Equity":
      return `Diversification across sectors reduces concentration risk while supporting your ${riskCategory} growth objectives.`;
    case "Government Bonds":
      if (riskCategory === "conservative") {
        return "Provides capital preservation and stable returns fitting your conservative risk tolerance.";
      }
      return "Provides a relatively lower-risk option that can support the stability portion of your portfolio.";
    case "Equity Mutual Funds":
      if (riskCategory === "aggressive") {
        return `Offers high-growth equity exposure suitable for your aggressive risk appetite and ${horizonDesc} horizon.`;
      }
      return `Professionally managed equity allocation aligned with your ${riskCategory} profile.`;
    case "Index Funds":
      return `Low-cost market tracking that aligns with your ${riskCategory} investment approach.`;
    case "Gold & Precious Metals":
      return `Serves as a portfolio stabilizer and inflation hedge compatible with your ${riskCategory} strategy.`;
    default:
      return `Matches your ${riskCategory} risk profile and ${horizonDesc} investment horizon.`;
  }
};

/**
 * Retrieves personalized investment recommendations for an authenticated user.
 *
 * Integrates the Task 10 ML Market-Context Prediction with the existing Task 4/5
 * rule-based suitability scoring into a hybrid suitability score.
 *
 * If the user has not completed a risk assessment, returns isPersonalized: false.
 */
export const getUserRecommendations = async (userId) => {
  const [userRisk, userProfile, rawInvestments, mlPrediction] = await Promise.all([
    getRiskAssessment(userId),
    getInvestmentProfile(userId),
    getAllInvestments(),
    getMarketRegimePrediction(),
  ]);

  // If user has not completed risk assessment, return clear unassessed state
  if (!userRisk) {
    return {
      recommendations: [],
      overallSuitability: null,
      overallSummary: null,
      isPersonalized: false,
      mlContext: mlPrediction || { available: false, isLive: false },
      message: "Complete your risk assessment to receive personalized recommendations.",
    };
  }

  // Calculate hybrid suitability score for each investment option
  const scored = rawInvestments.map((inv) => {
    const baseResult = calculateSuitability(inv, userRisk, userProfile);
    const hybridResult = calculateHybridSuitability(
      baseResult.score,
      mlPrediction,
      inv.category,
      inv.risk_level
    );
    const reason = generateRecommendationReason(inv, userRisk, userProfile);

    return {
      id: inv.id,
      name: inv.name,
      category: inv.category,
      riskLevel: inv.risk_level,
      baseSuitability: hybridResult.baseSuitability,
      mlAdjustment: hybridResult.mlAdjustment,
      hybridSuitability: hybridResult.hybridSuitability,
      suitabilityScore: hybridResult.hybridSuitability, // Backward compatible
      match: hybridResult.match,
      targetHorizon: inv.target_horizon,
      expectedReturn: inv.expected_return,
      minimumInvestment: inv.minimum_investment ? Number(inv.minimum_investment) : 500,
      description: inv.description,
      reason,
    };
  });

  // Sort descending by hybrid suitability score
  scored.sort((a, b) => b.hybridSuitability - a.hybridSuitability);

  // Take top recommendations (top 3 for the primary recommendation view)
  const topRecommendations = scored.slice(0, 3);

  // Compute average suitability score of top recommendations
  const overallSuitability = Math.round(
    topRecommendations.reduce((acc, curr) => acc + curr.hybridSuitability, 0) /
      (topRecommendations.length || 1)
  );

  const riskCat = userRisk.risk_category || "Moderate";
  const overallSummary = `Your current profile has a strong suitability match with a diversified ${riskCat.toLowerCase()}-risk investment strategy.`;

  return {
    recommendations: topRecommendations,
    allScoredInvestments: scored,
    overallSuitability,
    overallSummary,
    isPersonalized: true,
    methodology: mlPrediction?.available
      ? "hybrid (rule-based + ML market context)"
      : "rule-based",
    mlContext: mlPrediction || {
      available: false,
      reason: "ML prediction unavailable",
      isLive: false,
    },
    userContext: {
      riskCategory: userRisk.risk_category,
      riskScore: userRisk.risk_score,
      horizon: userProfile?.horizon || null,
    },
  };
};
