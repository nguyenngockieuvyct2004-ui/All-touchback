import { Router } from "express";
import {
  chatWithAi,
  listAvailableModels,
} from "../controllers/chatController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/", authRequired, chatWithAi);
// Public for diagnostics in development only. Consider securing before production.
router.get("/models", listAvailableModels);

export default router;
