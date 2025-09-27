import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  googleCallback,
  googleToken,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-token", googleToken); // Google One Tap / credential token
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
