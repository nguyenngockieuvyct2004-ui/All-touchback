import express from "express";
import { authRequired } from "../middleware/auth.js";
import PaymentCard from "../models/PaymentCard.js";

const router = express.Router();

// 💰 Nạp tiền
router.post("/topup", async (req, res) => {
  try {
    const { cardId, amount } = req.body;

    const card = await PaymentCard.findOne({
      cardId,
      userId: req.user.id
    });

    if (!card) return res.status(404).json({ message: "Không tìm thấy thẻ" });

    card.balance += amount;
    await card.save();

    res.json({ message: "Đã nạp tiền!", balance: card.balance });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 💸 Trừ tiền khi thanh toán
router.post("/charge", authRequired, async (req, res) => {
  try {
    const { cardId, amount } = req.body;

    const card = await PaymentCard.findOne({
      cardId,
      userId: req.user.id
    });

    if (!card) return res.status(404).json({ message: "Không tìm thấy thẻ" });
    if (card.status === "locked")
      return res.status(403).json({ message: "Thẻ đang bị khóa" });

    if (card.balance < amount)
      return res.status(400).json({ message: "Không đủ số dư" });

    card.balance -= amount;
    await card.save();

    res.json({ message: "Thanh toán thành công", balance: card.balance });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 📌 Xem số dư
router.get("/balance/:cardId", authRequired, async (req, res) => {
  try {
    const card = await PaymentCard.findOne({
      cardId: req.params.cardId,
      userId: req.user.id
    });

    if (!card) return res.status(404).json({ message: "Không tìm thấy thẻ" });

    res.json({ balance: card.balance, status: card.status });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
