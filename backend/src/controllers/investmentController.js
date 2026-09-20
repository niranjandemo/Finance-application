import {
  getAllInvestments,
  calculateSuitability,
} from "../models/investmentModel.js";
import {
  getInvestmentProfile,
  getRiskAssessment,
} from "../models/userModel.js";

export const getInvestments = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch user risk and profile data in parallel
    const [userRisk, userProfile, rawInvestments] = await Promise.all([
      getRiskAssessment(userId),
      getInvestmentProfile(userId),
      getAllInvestments(),
    ]);

    const isPersonalized = Boolean(userRisk || userProfile);

    // Compute rule-based suitability score for each investment option
    const scoredInvestments = rawInvestments.map((inv) => {
      const suitability = calculateSuitability(inv, userRisk, userProfile);

      return {
        id: inv.id,
        name: inv.name,
        category: inv.category,
        risk: inv.risk_level,
        riskLevel: inv.risk_level,
        match: suitability.match,
        suitabilityScore: suitability.score,
        targetHorizon: inv.target_horizon,
        expectedReturn: inv.expected_return,
        minimumInvestment: inv.minimum_investment ? Number(inv.minimum_investment) : 500,
        description: inv.description,
      };
    });

    // Sort by suitability score descending
    scoredInvestments.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    res.status(200).json({
      success: true,
      investments: scoredInvestments,
      isPersonalized,
      methodology: "rule-based",
      userContext: {
        hasRiskAssessment: Boolean(userRisk),
        riskCategory: userRisk?.risk_category || null,
        riskScore: userRisk?.risk_score ?? null,
        horizon: userProfile?.horizon || null,
      },
    });
  } catch (error) {
    console.error("Get investments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve investment options",
    });
  }
};
