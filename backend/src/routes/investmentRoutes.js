import express from "express";
import { getInvestments } from "../controllers/investmentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/investments - Retrieve available investment options scored for authenticated user
router.get("/", authenticateToken, getInvestments);

export default router;
