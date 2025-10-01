import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import dotenv from "dotenv";
import "express-async-errors";
import path from "path";
import { fileURLToPath } from "url";
import { setupPassport } from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import nfcRoutes from "./routes/nfcRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
setupPassport();

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(passport.initialize());

// Static "uploads" directory to serve uploaded files (images/videos)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");
// Override CORP for static uploads so the frontend (different origin in dev) can load them
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsDir, { fallthrough: true })
);

app.get("/health", (_req, res) => {
  const hasJwt = !!process.env.JWT_SECRET;
  const googleId = process.env.GOOGLE_CLIENT_ID || "";
  const googleConfigured = !!googleId;
  const googleIdMasked = googleId
    ? `${googleId.slice(0, 8)}...${googleId.slice(-10)}`
    : null;
  res.json({
    status: "ok",
    jwtConfigured: hasJwt,
    googleConfigured,
    googleIdMasked,
  });
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/memories", memoryRoutes);
app.use("/nfc", nfcRoutes);
app.use("/m", nfcRoutes); // public slug resolve
app.use("/chat", chatRoutes);
app.use("/upload", uploadRoutes);
app.use("/public", publicRoutes);

app.use(errorHandler);

export default app;
