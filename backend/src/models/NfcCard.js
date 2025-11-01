import { Schema, model, Types } from "mongoose";

const nfcCardSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    slug: { type: String, unique: true, required: true },
    title: String,
    linkedMemoryIds: [{ type: Types.ObjectId, ref: "Memory" }],
    // Legacy active flag (kept for backward compat). Use 'status' for new flow
    isActive: { type: Boolean, default: true },
    // Commercial flow additions
    status: {
      type: String,
      enum: ["unactivated", "active", "disabled"],
      default: "active",
      index: true,
    },
    orderId: { type: Types.ObjectId, ref: "Order", index: true },
    productId: { type: Types.ObjectId, ref: "Product", index: true },
    productCode: { type: String },
    activationCode: { type: String, index: true }, // used for gift/claim
    tagUid: { type: String, unique: true, sparse: true }, // NFC chip UID
    // Optional business card profile for public card page
    profile: {
      name: String,
      title: String,
      company: String,
      phone: String,
      email: String,
      website: String,
      address: String,
      intro: String,
      avatar: String, // URL to avatar image
      cover: String, // URL to cover image
      socials: [
        new Schema(
          {
            label: String, // e.g., Facebook, LinkedIn
            url: String,
          },
          { _id: false }
        ),
      ],
    },
    // Prefer this memory when rendering public card
    primaryMemoryId: { type: Types.ObjectId, ref: "Memory" },
    // Trạng thái thất lạc (Lost mode) cho danh thiếp
    lost: {
      isLost: { type: Boolean, default: false }, // Bật/tắt chế độ Lost
      title: { type: String, default: "" }, // Tiêu đề hiển thị khi Lost
      message: { type: String, default: "" }, // Nội dung hiển thị khi Lost
      contact: {
        name: { type: String, default: "" }, // Tên liên hệ
        phone: { type: String, default: "" }, // Số điện thoại
        email: { type: String, default: "" }, // Email
      },
      updatedAt: { type: Date }, // Thời điểm cấu hình gần nhất
    },
  },
  { timestamps: true }
);

export default model("NfcCard", nfcCardSchema);
