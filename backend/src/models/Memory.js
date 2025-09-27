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

// Ensure API responses keep backward compat with "content" field
function transformDoc(_doc, ret) {
  if (!ret.content && typeof ret.description !== "undefined") {
    ret.content = ret.description;
  }
  if (ret._id && !ret.id) ret.id = String(ret._id);
  delete ret.__v;
  return ret;
}

memorySchema.set("toJSON", { virtuals: true, transform: transformDoc });
memorySchema.set("toObject", { virtuals: true, transform: transformDoc });

export default model("Memory", memorySchema);
