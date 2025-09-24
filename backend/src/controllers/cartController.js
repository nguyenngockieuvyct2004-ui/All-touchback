import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Joi from "joi";

const addSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
});

export async function getCart(req, res) {
  const cart = (await Cart.findOne({ userId: req.user.id })) || { items: [] };
  res.json(cart);
}

export async function addToCart(req, res, next) {
  try {
    const { productId, quantity } = await addSchema.validateAsync(req.body);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
    const existing = cart.items.find(
      (i) => i.productId.toString() === productId
    );
    if (existing) existing.quantity += quantity;
    else cart.items.push({ productId, quantity, priceSnapshot: product.price });
    await cart.save();
    res.json(cart);
  } catch (e) {
    next(e);
  }
}

export async function updateCartItem(req, res) {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart empty" });
  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) return res.status(404).json({ message: "Item not in cart" });
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  res.json(cart);
}
