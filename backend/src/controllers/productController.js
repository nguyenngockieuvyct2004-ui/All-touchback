import Product from "../models/Product.js";
import Joi from "joi";
import { toUploadRelative } from "../utils/urls.js";
import Category from "../models/Category.js";

const productSchema = Joi.object({
  name: Joi.string().min(1).required(),
  code: Joi.string().min(2).required(),
  category: Joi.string().min(1).required(),
  variant: Joi.string().allow("", null),
  description: Joi.string().allow("", null),
  price: Joi.number().positive().required(),
  // Hỗ trợ cả URL tuyệt đối lẫn đường dẫn tương đối
  images: Joi.array().items(Joi.string().min(1)).default([]),
  isFeatured: Joi.boolean().default(false),
});

export async function listProducts(_req, res) {
  const products = await Product.find();
  res.json(products);
}

// Bulk create products. Accepts an array of objects. Supports images array of URLs.
export async function bulkCreateProducts(req, res, next) {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.items || [];
    if (!items.length)
      return res.status(400).json({ message: "No products provided" });

    const created = [];
    const errors = [];

    for (const [idx, raw] of items.entries()) {
      try {
        const data = await productSchema.validateAsync(raw);
        if (Array.isArray(data.images))
          data.images = data.images.map((u) => toUploadRelative(u));
        // If category provided, try to find Category; if not found, allow string category (admin-created earlier)
        const p = await Product.create(data);
        created.push(p);
      } catch (e) {
        errors.push({ index: idx, message: e.message });
      }
    }

    res.status(201).json({ created, errors });
  } catch (e) {
    next(e);
  }
}

export async function getProduct(req, res) {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
}

export async function createProduct(req, res, next) {
  try {
    const data = await productSchema.validateAsync(req.body);
    if (Array.isArray(data.images)) {
      data.images = data.images.map((u) => toUploadRelative(u));
    }
    const exists = await Product.findOne({ code: data.code });
    if (exists)
      return res.status(400).json({ message: "Mã sản phẩm đã tồn tại" });
    const p = await Product.create(data);
    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(req, res, next) {
  try {
    // Allow partial updates: make core fields optional for update
    const data = await productSchema
      .fork(["code", "category", "name", "price"], (s) => s.optional())
      .validateAsync(req.body);
    if (Array.isArray(data.images)) {
      data.images = data.images.map((u) => toUploadRelative(u));
    }
    const p = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) {
    next(e);
  }
}

export async function deleteProduct(req, res) {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json({ success: true });
}
