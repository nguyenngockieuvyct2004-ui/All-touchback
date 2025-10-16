import { Schema, model, Types } from "mongoose";

const cartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", unique: true },
    items: [
      {
        productId: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        // Mục đích sử dụng do khách chọn ở trang sản phẩm
        // 'nfc' = Danh thiếp NFC, 'memory' = Lưu trữ ảnh/video
        purpose: { type: String, enum: ["nfc", "memory"], default: "nfc" },
        priceSnapshot: Number,
      },
    ],
  },
  { timestamps: true }
);

export default model("Cart", cartSchema);
