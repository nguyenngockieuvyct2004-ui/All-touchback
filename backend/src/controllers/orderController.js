import Joi from "joi";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { buildVnpayPaymentUrl } from "./vnpayController.js";
import { provisionCardsForOrder } from "../services/provisioningService.js";
import NfcCard from "../models/NfcCard.js";

const checkoutSchema = Joi.object({
  // Accept either free text or structured form 'prov|dist|ward|detail'
  shippingAddress: Joi.string().min(3).required().messages({
    "any.required": "Vui lòng nhập địa chỉ nhận hàng",
    "string.empty": "Vui lòng nhập địa chỉ nhận hàng",
    "string.min": "Địa chỉ quá ngắn",
  }),
  phone: Joi.string()
    .pattern(/^[0-9+()\s-]{8,20}$/)
    .required()
    .messages({
      "any.required": "Vui lòng nhập số điện thoại",
      "string.pattern.base": "Số điện thoại không hợp lệ",
      "string.empty": "Vui lòng nhập số điện thoại",
    }),
  note: Joi.string().allow("", null),
  paymentMethod: Joi.string().valid("cod", "bank", "momo").default("cod"),
});

export async function checkout(req, res, next) {
  try {
    const { shippingAddress, phone, note, paymentMethod } =
      await checkoutSchema.validateAsync(req.body || {});
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }
    // Snapshot items to avoid future price changes affecting past orders
    const items = cart.items
      .filter((i) => i.productId)
      .map((i) => ({
        productId: i.productId._id,
        name: i.productId.name,
        price: i.productId.price,
        quantity: i.quantity,
      }));
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({
      userId: req.user.id,
      items,
      total,
      status: paymentMethod === "cod" ? "pending" : "pending", // may adjust later
      shippingAddress,
      phone,
      note,
      paymentMethod,
    });
    // Clear cart after placing order
    cart.items = [];
    await cart.save();

    if (paymentMethod === "bank") {
      try {
        // Tạo link thanh toán VNPay (hàm tách riêng trong vnpayController)
        const { payUrl, vnpTxnRef } = buildVnpayPaymentUrl({
          order,
          total,
          req,
        });
        order.payment = { provider: "vnpay", vnpTxnRef };
        await order.save();
        return res.status(201).json({ order, payUrl });
      } catch (err) {
        return res
          .status(500)
          .json({ message: err.message || "Lỗi tạo link VNPay" });
      }
    }

    res.status(201).json({ order });
  } catch (e) {
    next(e);
  }
}

export async function myOrders(req, res) {
  const orders = await Order.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(orders);
}

// Admin endpoints
export async function listOrders(_req, res) {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("userId", "email fullName");
  res.json(orders);
}

export async function updateOrderStatus(req, res) {
  const schema = Joi.object({
    status: Joi.string()
      .valid("pending", "paid", "shipped", "completed", "cancelled")
      .required(),
  });
  const { status } = await schema.validateAsync(req.body);
  const prev = await Order.findById(req.params.id);
  if (!prev) return res.status(404).json({ message: "Not found" });
  const was = prev.status;
  prev.status = status;
  const order = await prev.save();
  if (was !== "paid" && status === "paid") {
    try {
      await provisionCardsForOrder(order);
    } catch (e) {
      console.error("Provision cards error:", e);
    }
  }
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
}

// Các hàm vnpayIpn & vnpayReturn đã được tách sang vnpayController.js

export async function getOrderCards(req, res) {
  const orderId = req.params.id;
  const order = await Order.findOne({ _id: orderId, userId: req.user.id });
  if (!order) return res.status(404).json({ message: "Not found" });
  const cards = await NfcCard.find({ orderId }).sort({ createdAt: 1 });
  res.json(cards);
}
