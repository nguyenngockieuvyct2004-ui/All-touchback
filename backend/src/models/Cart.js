import { Schema, model, Types } from "mongoose";

const cartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", unique: true },
    items: [
      {
        productId: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        priceSnapshot: Number,
      },
    ],
  },
  { timestamps: true }
);

export default model("Cart", cartSchema);
