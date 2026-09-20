import express from "express";
import { getBrokers, getBrokerProducts } from "../controllers/brokerController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/brokers - Retrieve informational broker directory
router.get("/", authenticateToken, getBrokers);

// GET /api/brokers/:id/products - Retrieve products for a specific broker
router.get("/:id/products", authenticateToken, getBrokerProducts);

export default router;
