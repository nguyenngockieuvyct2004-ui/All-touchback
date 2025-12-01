import mongoose from "mongoose";

const PaymentCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "locked"], default: "active" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("PaymentCard", PaymentCardSchema);
