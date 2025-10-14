import { Schema, model, Types } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    total: Number,
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    shippingAddress: String,
    phone: String,
    note: String,
    paymentMethod: {
      type: String,
      enum: ["cod", "bank", "momo"],
      default: "cod",
    },
  },
  { timestamps: true }
);

export default model("Order", orderSchema);
