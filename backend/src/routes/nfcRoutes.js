import { Router } from "express";
import {
  createCard,
  linkMemories,
  resolveSlug,
  listCards,
  updateCard,
  listCardMemories,
  activateCard,
  updateLostCard,
} from "../controllers/nfcController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, listCards);
router.post("/", authRequired, createCard);
router.post("/:id/link", authRequired, linkMemories);
router.get("/:id/memories", authRequired, listCardMemories);
router.put("/:id", authRequired, updateCard);
router.patch("/:id/lost", authRequired, updateLostCard);
router.post("/activate", authRequired, activateCard);
router.get("/:slug", resolveSlug);

export default router;
