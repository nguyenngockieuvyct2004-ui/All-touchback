import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", authRequired, requireRole(["admin"]), createProduct);
router.put("/:id", authRequired, requireRole(["admin"]), updateProduct);
router.delete("/:id", authRequired, requireRole(["admin"]), deleteProduct);

export default router;
