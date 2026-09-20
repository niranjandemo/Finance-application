import { getUserRecommendations } from "../models/recommendationModel.js";

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const data = await getUserRecommendations(userId);

    res.status(200).json({
      success: true,
      recommendations: data.recommendations,
      overallSuitability: data.overallSuitability,
      overallSummary: data.overallSummary,
      isPersonalized: data.isPersonalized,
      methodology: data.methodology || "rule-based",
      message: data.message,
      userContext: data.userContext,
      mlContext: data.mlContext,
    });
  } catch (error) {
    console.error("Get recommendations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
    });
  }
};
