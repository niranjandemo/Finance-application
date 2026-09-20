import { getRecommendationExplanation } from "../models/explanationModel.js";

/**
 * Controller for retrieving transparent, rule-based recommendation explanations.
 *
 * Endpoint: GET /api/recommendations/explain?investmentId=<id>
 */
export const getExplanation = async (req, res) => {
  try {
    // 1. Authenticated user ID comes strictly from JWT payload
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Validate investmentId parameter
    const rawInvestmentId = req.query.investmentId;
    if (!rawInvestmentId) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'investmentId' is required",
      });
    }

    const investmentId = parseInt(rawInvestmentId, 10);
    if (isNaN(investmentId) || investmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid positive integer 'investmentId' is required",
      });
    }

    // 3. Retrieve explanation using rule-based model
    const explanationData = await getRecommendationExplanation(userId, investmentId);

    // 4. Handle investment not found
    if (explanationData?.notFound) {
      return res.status(404).json({
        success: false,
        message: `Investment with ID ${investmentId} not found`,
      });
    }

    // 5. Return explanation response
    return res.status(200).json(explanationData);
  } catch (error) {
    console.error("Error generating recommendation explanation:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating the recommendation explanation",
    });
  }
};
