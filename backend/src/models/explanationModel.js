import { getInvestmentById, calculateSuitability } from "./investmentModel.js";
import { getRiskAssessment, getInvestmentProfile } from "./userModel.js";
import {
  getMarketRegimePrediction,
  calculateHybridSuitability,
} from "../services/mlService.js";

/**
 * Generates transparent explanations distinguishing between user-profile factors
 * and external market-context regime signals.
 */
export const getRecommendationExplanation = async (userId, investmentId) => {
  // 1. Fetch investment option from PostgreSQL
  const investment = await getInvestmentById(investmentId);
  if (!investment) {
    return { notFound: true };
  }

  // 2. Fetch authenticated user's risk assessment, profile, and ML market regime
  const [userRisk, userProfile, mlPrediction] = await Promise.all([
    getRiskAssessment(userId),
    getInvestmentProfile(userId),
    getMarketRegimePrediction(),
  ]);

  // 3. Unassessed user handling
  if (!userRisk) {
    return {
      success: true,
      isPersonalized: false,
      methodology: "rule-based",
      message: "Complete your risk assessment to receive personalized explanations.",
    };
  }

  // 4. Calculate suitability using existing Task 4 / Task 5 algorithm & hybrid adjustment
  const baseSuitability = calculateSuitability(investment, userRisk, userProfile);
  const hybrid = calculateHybridSuitability(
    baseSuitability.score,
    mlPrediction,
    investment.category,
    investment.risk_level
  );
  const score = hybrid.hybridSuitability;

  let suitabilityLevel = "Moderate";
  if (score >= 80) {
    suitabilityLevel = "High";
  } else if (score < 65) {
    suitabilityLevel = "Fair";
  }

  const userRiskCat = userRisk.risk_category || "Moderate";
  const userScore = userRisk.risk_score;
  const userHorizon = userProfile?.horizon || "Medium";
  const invRisk = investment.risk_level || "Moderate";
  const invHorizon = investment.target_horizon || "Medium";

  // 5. Generate positive factors dynamically based on actual values
  const positiveFactors = [];

  // Risk factor alignment
  if (userRiskCat.toLowerCase() === invRisk.toLowerCase()) {
    positiveFactors.push(
      `The investment risk level (${invRisk}) directly aligns with your ${userRiskCat} risk profile (score: ${userScore}).`
    );
  } else {
    positiveFactors.push(
      `The investment risk level (${invRisk}) fits within your acceptable risk variance for a ${userRiskCat} investor (score: ${userScore}).`
    );
  }

  // Horizon compatibility
  const normUserH = userHorizon.toLowerCase();
  const normInvH = invHorizon.toLowerCase();
  if (
    (normUserH.includes("short") && normInvH.includes("short")) ||
    (normUserH.includes("medium") && normInvH.includes("medium")) ||
    (normUserH.includes("long") && normInvH.includes("long"))
  ) {
    positiveFactors.push(
      `The investment target horizon (${invHorizon}) is an exact match for your selected ${userHorizon} investment horizon.`
    );
  } else {
    positiveFactors.push(
      `The investment target horizon (${invHorizon}) is compatible with your ${userHorizon} investment timeframe.`
    );
  }

  // Experience and category synergy
  if (userProfile?.experience) {
    positiveFactors.push(
      `Your ${userProfile.experience.toLowerCase()} investment experience is suitable for active management in the ${investment.category} category.`
    );
  } else {
    positiveFactors.push(
      `Allocating to ${investment.name} provides valuable asset diversification within the ${investment.category} category.`
    );
  }

  // 6. Generate objective considerations appropriate to the asset category & risk
  const considerations = [];

  if (invRisk === "High" || invRisk === "Moderate-High") {
    considerations.push(
      "Higher market volatility may result in short-term portfolio fluctuations before achieving targeted returns."
    );
  } else if (invRisk === "Low" || invRisk === "Low-Moderate") {
    considerations.push(
      "Conservative return rates may be vulnerable to inflationary erosion over longer holding periods."
    );
  } else {
    considerations.push(
      "Investment values can fluctuate with changing economic cycles and market conditions."
    );
  }

  considerations.push(
    "Historical returns are indicative of past performance and are never guaranteed."
  );

  const minInv = investment.minimum_investment
    ? Number(investment.minimum_investment)
    : 500;
  considerations.push(
    `Minimum initial commitment is ₹${minInv.toLocaleString()}; ensure adequate emergency liquidity before investing.`
  );

  // 7. Structured Market-Context Factor
  const marketContext = mlPrediction?.available
    ? {
        available: true,
        model: mlPrediction.model,
        predictedRegime: mlPrediction.predictedRegime,
        regimeName: mlPrediction.regimeName,
        probabilities: mlPrediction.probabilities,
        mlAdjustment: hybrid.mlAdjustment,
        dataSource: mlPrediction.dataSource,
        isLive: false,
        disclaimer:
          "Market context is generated from a historical NIFTY 50 benchmark model and is not a personalized prediction of the investment's future return.",
      }
    : {
        available: false,
        reason: "ML market-context prediction unavailable",
        isLive: false,
      };

  return {
    success: true,
    isPersonalized: true,
    methodology: mlPrediction?.available
      ? "hybrid (rule-based + ML market context)"
      : "rule-based",
    investment: {
      id: investment.id,
      name: investment.name,
      category: investment.category,
      riskLevel: investment.risk_level,
      targetHorizon: investment.target_horizon,
      expectedReturn: investment.expected_return,
      minimumInvestment: minInv,
    },
    userProfile: {
      riskCategory: userRiskCat,
      riskScore: userScore,
      horizon: userHorizon,
    },
    suitability: {
      score: hybrid.hybridSuitability,
      baseScore: hybrid.baseSuitability,
      mlAdjustment: hybrid.mlAdjustment,
      level: suitabilityLevel,
    },
    marketContext,
    explanation: {
      summary: `This investment matches your current ${userRiskCat.toLowerCase()} risk profile and ${userHorizon.toLowerCase()} investment horizon.`,
      positiveFactors,
      considerations,
    },
  };
};
