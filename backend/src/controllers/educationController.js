import { getAllEducationContent } from "../models/educationModel.js";

/**
 * Controller for retrieving financial education content.
 *
 * Endpoint: GET /api/education
 */
export const getEducationContent = async (req, res) => {
  try {
    const content = await getAllEducationContent();

    return res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("Error fetching financial education content:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve financial education content",
    });
  }
};
