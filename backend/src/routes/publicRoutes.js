import { Router } from "express";
import {
  getPublicCard,
  getPublicCardVcard,
} from "../controllers/publicController.js";

const router = Router();

router.get("/cards/:slug", getPublicCard);
router.get("/cards/:slug/vcard", getPublicCardVcard);

export default router;
