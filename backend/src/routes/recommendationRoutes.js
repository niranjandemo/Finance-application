import express from "express";
import { getRecommendations } from "../controllers/recommendationController.js";
import { getExplanation } from "../controllers/explanationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/recommendations - Generate rule-based recommendations for authenticated user
router.get("/", authenticateToken, getRecommendations);

// GET /api/recommendations/explain - Generate rule-based explanation for a specific investment
router.get("/explain", authenticateToken, getExplanation);

export default router;
