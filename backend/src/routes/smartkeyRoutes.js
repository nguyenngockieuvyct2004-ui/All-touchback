import express from "express";
import { authRequired } from "../middleware/auth.js";
import SmartKeyCard from "../models/SmartKeyCard.js";

const router = express.Router();

// 🔐 Khóa thẻ
router.post("/lock", async (req, res) => {
  try {
    const { cardId } = req.body;

    const card = await SmartKeyCard.findOne({
      cardId,
      userId: req.user.id
    });

    if (!card) return res.status(404).json({ message: "Không tìm thấy thẻ" });

    card.status = "locked";
    await card.save();

    res.json({ message: "Đã khóa thẻ", status: "locked" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔓 Mở khóa thẻ
router.post("/unlock", async (req, res) => {
  try {
    const { cardId } = req.body;

    const card = await SmartKeyCard.findOne({
      cardId,
      userId: req.user.id
    });

    if (!card) return res.status(404).json({ message: "Không tìm thấy thẻ" });

    card.status = "active";
    await card.save();

    res.json({ message: "Đã mở khóa thẻ", status: "active" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
