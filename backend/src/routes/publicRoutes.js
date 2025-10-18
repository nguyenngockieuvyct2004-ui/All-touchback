import { Router } from "express";
import {
  getPublicCard,
  getPublicCardVcard,
  getPublicMemory,
} from "../controllers/publicController.js";

const router = Router();

router.get("/cards/:slug", getPublicCard);
router.get("/cards/:slug/vcard", getPublicCardVcard);
router.get("/memories/:slug", getPublicMemory);

export default router;
