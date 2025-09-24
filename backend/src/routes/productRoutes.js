import { Router } from "express";
import {
  listProducts,
  createProduct,
} from "../controllers/productController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listProducts);
router.post(
  "/",
  authRequired,
  requireRole(["admin", "manager"]),
  createProduct
);

export default router;
