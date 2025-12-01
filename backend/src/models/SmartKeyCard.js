import mongoose from "mongoose";

const smartKeyCardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cardId: { type: String, unique: true, required: true }, 
    balance: { type: Number, default: 0 }, 
    status: { type: String, enum: ["active", "locked"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("SmartKeyCard", smartKeyCardSchema);
