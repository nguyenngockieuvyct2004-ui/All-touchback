import { Schema, model, Types } from "mongoose";

const mediaSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    caption: String,
  },
  { _id: false }
);

const memorySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    cardId: { type: Types.ObjectId, ref: "NfcCard" },
    title: { type: String, required: true },
    description: String,
    media: [mediaSchema],
    tags: [String],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model("Memory", memorySchema);
