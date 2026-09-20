import express from "express";
import { getExplanation } from "../controllers/explanationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/recommendations/explain?investmentId=<id>
// Protected by JWT authentication
router.get("/", authenticateToken, getExplanation);

export default router;
