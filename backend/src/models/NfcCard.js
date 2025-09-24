import { Schema, model, Types } from "mongoose";

const nfcCardSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    slug: { type: String, unique: true, required: true },
    title: String,
    linkedMemoryIds: [{ type: Types.ObjectId, ref: "Memory" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model("NfcCard", nfcCardSchema);
