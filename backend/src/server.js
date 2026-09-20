import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import explanationRoutes from "./routes/explanationRoutes.js";
import brokerRoutes from "./routes/brokerRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import { initDb } from "./config/initDb.js";

dotenv.config();

// Initialize tables if not already present
initDb();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/recommendations/explain", explanationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/brokers", brokerRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/market/ml-prediction", mlRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "InvestAI backend is running",
  });
});

// Database test
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database connection successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`InvestAI backend running on port ${PORT}`);
});