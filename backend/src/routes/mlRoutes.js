import express from "express";
import { getMlPrediction } from "../controllers/mlController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected: requires verified JWT token
router.get("/prediction", authenticateToken, getMlPrediction);
router.get("/", authenticateToken, getMlPrediction);

export default router;
