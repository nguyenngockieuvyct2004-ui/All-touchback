import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import {
  checkout,
  myOrders,
  listOrders,
  updateOrderStatus,
  getOrderCards,
} from "../controllers/orderController.js";
import { vnpayIpn, vnpayReturn } from "../controllers/vnpayController.js";

const router = Router();

// User
router.post("/checkout", authRequired, checkout);
router.get("/mine", authRequired, myOrders);
router.get("/:id/cards", authRequired, getOrderCards);

// Admin
router.get("/", authRequired, requireRole(["admin"]), listOrders);
router.put(
  "/:id/status",
  authRequired,
  requireRole(["admin"]),
  updateOrderStatus
);

// VNPay payment callbacks (public endpoints)
router.get("/vnpay_ipn", vnpayIpn); // IPN server to server
router.get("/vnpay_return", vnpayReturn); // customer browser redirect

export default router;
