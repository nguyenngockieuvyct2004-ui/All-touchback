import Joi from "joi";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

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
      status: "pending",
      shippingAddress,
      phone,
      note,
      paymentMethod,
    });
    // Clear cart after placing order
    cart.items = [];
    await cart.save();
    res.status(201).json(order);
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
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
}
