import express from "express";
import cors from "cors";
import morgan from "morgan";
import paymentRoutes from "./routes/paymentRoutes.js";
import smartkeyRoutes from "./routes/smartkeyRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express(); // ✅ Tạo app trước

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/payment", paymentRoutes);
app.use("/api/smartkey", smartkeyRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

export default app;
