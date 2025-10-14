import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import {
  checkout,
  myOrders,
  listOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = Router();

// User
router.post("/checkout", authRequired, checkout);
router.get("/mine", authRequired, myOrders);

// Admin
router.get("/", authRequired, requireRole(["admin"]), listOrders);
router.put(
  "/:id/status",
  authRequired,
  requireRole(["admin"]),
  updateOrderStatus
);

export default router;
