import express from "express";
import { getEducationContent } from "../controllers/educationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/education - Retrieve financial education library
router.get("/", authenticateToken, getEducationContent);

export default router;
