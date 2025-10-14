import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleActive,
} from "../controllers/adminUserController.js";

const router = Router();

router.use(authRequired, requireRole(["admin"]));

router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/active", toggleActive);

export default router;
