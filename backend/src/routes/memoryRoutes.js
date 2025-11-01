import { Router } from "express";
import {
  listMemories,
  createMemory,
  getMemory,
  updateMemory,
  deleteMemory,
  resetMemory,
} from "../controllers/memoryController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, listMemories);
router.post("/", authRequired, createMemory);
router.get("/:id", authRequired, getMemory);
router.put("/:id", authRequired, updateMemory);
router.delete("/:id", authRequired, deleteMemory);
router.post("/:id/reset", authRequired, resetMemory);

export default router;
