import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import { basicStats, dashboardStats } from "../controllers/statsController.js";

const router = Router();

router.get("/basic", authRequired, requireRole(["admin"]), basicStats);
router.get(
  "/dashboard",
  authRequired,
  requireRole(["admin", "manager"]),
  dashboardStats
);

export default router;
