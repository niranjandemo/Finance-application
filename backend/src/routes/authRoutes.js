import express from "express";

import {
  register,
  login,
} from "../controllers/authController.js";

import {
  authenticateToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get(
  "/me",
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

export default router;