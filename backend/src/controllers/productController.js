import Product from "../models/Product.js";
import Joi from "joi";

const productSchema = Joi.object({
  name: Joi.string().min(1).required(),
  code: Joi.string().min(2).required(),
  category: Joi.string().valid("basic", "plus", "premium").required(),
  variant: Joi.string().allow("", null),
  description: Joi.string().allow("", null),
  price: Joi.number().positive().required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  isFeatured: Joi.boolean().default(false),
});

export async function listProducts(_req, res) {
  const products = await Product.find();
  res.json(products);
}

export async function createProduct(req, res, next) {
  try {
    const data = await productSchema.validateAsync(req.body);
    const exists = await Product.findOne({ code: data.code });
    if (exists)
      return res.status(400).json({ message: "Mã sản phẩm đã tồn tại" });
    const p = await Product.create(data);
    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
}
