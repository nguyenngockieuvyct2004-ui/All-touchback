import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    category: {
      type: String,
      enum: ["basic", "plus", "premium"],
      required: true,
    },
    variant: String,
    description: String,
    price: { type: Number, required: true },
    images: [String],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Product", productSchema);
