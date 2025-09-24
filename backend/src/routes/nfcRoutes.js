import { Router } from "express";
import {
  createCard,
  linkMemories,
  resolveSlug,
} from "../controllers/nfcController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/", authRequired, createCard);
router.post("/:id/link", authRequired, linkMemories);
router.get("/:slug", resolveSlug);

export default router;
