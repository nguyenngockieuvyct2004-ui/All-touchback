import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Joi from "joi";

const addSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
});

export async function getCart(req, res) {
  let cart = await Cart.findOne({ userId: req.user.id }).populate(
    "items.productId"
  );
  if (!cart) return res.json({ items: [] });
  // Chuẩn hoá dữ liệu cho frontend: thêm field product với dữ liệu đã populate
  const shaped = {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items.map((it) => ({
      productId: it.productId?._id,
      quantity: it.quantity,
      priceSnapshot: it.priceSnapshot,
      product: it.productId
        ? {
            _id: it.productId._id,
            name: it.productId.name,
            price: it.productId.price,
            images: it.productId.images,
            code: it.productId.code,
            category: it.productId.category,
          }
        : null,
    })),
  };
  res.json(shaped);
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
    // populate product for immediate response consistency
    await cart.populate("items.productId");
    return getCart(req, res); // reuse shape logic
  } catch (e) {
    next(e);
  }
}

export async function updateCartItem(req, res) {
  const schema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required(),
  });
  const { productId, quantity } = await schema.validateAsync(req.body);
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
  await cart.populate("items.productId");
  return getCart(req, res);
}

export async function clearCart(req, res) {
  let cart = await Cart.findOne({ userId: req.user.id });
  if (cart) {
    cart.items = [];
    await cart.save();
  } else {
    cart = await Cart.create({ userId: req.user.id, items: [] });
  }
  res.json({ items: [] });
}
