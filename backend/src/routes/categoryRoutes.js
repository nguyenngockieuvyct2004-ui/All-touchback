import { Router } from "express";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listCategories);
router.get("/:id", getCategory);
router.post("/", authRequired, requireRole(["admin"]), createCategory);
router.put("/:id", authRequired, requireRole(["admin"]), updateCategory);
router.delete("/:id", authRequired, requireRole(["admin"]), deleteCategory);

export default router;
