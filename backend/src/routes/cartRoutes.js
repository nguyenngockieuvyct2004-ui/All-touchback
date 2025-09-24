import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
} from "../controllers/cartController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, getCart);
router.post("/add", authRequired, addToCart);
router.post("/update", authRequired, updateCartItem);

export default router;
