import express from "express";
import { getMarketOverview } from "../controllers/marketController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/market - Retrieve benchmark indices and popular stocks
router.get("/", authenticateToken, getMarketOverview);

export default router;
