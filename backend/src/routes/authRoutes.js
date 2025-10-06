import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  googleCallback,
  googleToken,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
// Simple in-memory rate limit (development / small scale). For production replace with Redis.
const buckets = new Map();
function rateLimit(keyBase, limit, windowMs) {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const key = keyBase + ":" + ip;
    const now = Date.now();
    const entry = buckets.get(key) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + windowMs;
    }
    entry.count++;
    buckets.set(key, entry);
    if (entry.count > limit) {
      const waitSec = Math.max(1, Math.round((entry.reset - now) / 1000));
      return res.status(429).json({ message: `Thử lại sau ${waitSec}s` });
    }
    next();
  };
}

const router = Router();

// Normalize email to lowercase early (if present)
router.use((req, res, next) => {
  if (req.body && typeof req.body.email === "string") {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  next();
});

router.post("/register", register);
router.post("/login", login);
router.post("/google-token", googleToken); // Google One Tap / credential token
router.post("/forgot", rateLimit("forgot", 5, 15 * 1000), forgotPassword);
router.post("/reset", rateLimit("reset", 8, 15 * 1000), resetPassword);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/fail",
  }),
  googleCallback
);

export default router;
