import { Schema, model, Types } from "mongoose";

const mediaSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video", "audio"], required: true },
    url: { type: String, required: true },
    caption: String,
  },
  { _id: false }
);

const memorySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    cardId: { type: Types.ObjectId, ref: "NfcCard" },
    // Nếu memory được tạo tự động từ đơn hàng
    orderId: { type: Types.ObjectId, ref: "Order" },
    productId: { type: Types.ObjectId, ref: "Product" },
    // Slug public để chia sẻ như /m/:slug
    slug: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    description: String,
    media: [mediaSchema],
    // Ảnh bìa hiển thị ở đầu trang public (không lặp lại trong gallery)
    coverImageUrl: String,
    // Nhạc nền trang public (tệp audio đã upload)
    bgAudioUrl: String,
    // Cách hiển thị gallery trên trang public
    galleryStyle: { type: String, enum: ["grid", "carousel"], default: "grid" },
    tags: [String],
    isPublic: { type: Boolean, default: true },
    // Trạng thái thất lạc (Lost mode) cho memory
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
