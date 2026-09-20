import express from "express";

import {
  getProfile,
  saveProfile,
  getRiskAssessment,
  saveRiskAssessment,
  getDashboard,
} from "../controllers/userController.js";

import {
  authenticateToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/profile",
  authenticateToken,
  getProfile
);

router.post(
  "/profile",
  authenticateToken,
  saveProfile
);

router.get(
  "/risk-assessment",
  authenticateToken,
  getRiskAssessment
);

router.post(
  "/risk-assessment",
  authenticateToken,
  saveRiskAssessment
);

router.get(
  "/dashboard",
  authenticateToken,
  getDashboard
);

export default router;