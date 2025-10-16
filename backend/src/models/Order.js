import { Schema, model, Types } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    name: String,
    price: Number,
    quantity: Number,
    // Lưu lại lựa chọn của khách cho từng sản phẩm trong đơn
    purpose: { type: String, enum: ["nfc", "memory"], default: "nfc" },
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
    // Extended payment data for gateways (VNPay etc.)
    payment: {
      provider: String, // e.g. 'vnpay'
      vnpTxnRef: String,
      vnpTransactionNo: String,
      vnpBankCode: String,
      vnpCardType: String,
      vnpPayDate: String,
      vnpResponseCode: String,
      vnpTransactionStatus: String,
      rawReturnData: Schema.Types.Mixed,
      rawIpnData: Schema.Types.Mixed,
      paidAt: Date,
    },
  },
  { timestamps: true }
);

export default model("Order", orderSchema);
