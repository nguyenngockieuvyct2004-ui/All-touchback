import Category from "../models/Category.js";
import Joi from "joi";

const schema = Joi.object({
  name: Joi.string().min(1).required(),
  slug: Joi.string().allow("", null),
  description: Joi.string().allow("", null),
});

export async function listCategories(_req, res) {
  const cats = await Category.find().sort({ name: 1 });
  res.json(cats);
}

export async function getCategory(req, res) {
  const c = await Category.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Not found" });
  res.json(c);
}

export async function createCategory(req, res, next) {
  try {
    const data = await schema.validateAsync(req.body);
    if (!data.slug && data.name)
      data.slug = String(data.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const exists = await Category.findOne({ slug: data.slug });
    if (exists) return res.status(400).json({ message: "Slug already exists" });
    const c = await Category.create(data);
    res.status(201).json(c);
  } catch (e) {
    next(e);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const data = await schema.validateAsync(req.body);
    const c = await Category.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!c) return res.status(404).json({ message: "Not found" });
    res.json(c);
  } catch (e) {
    next(e);
  }
}

export async function deleteCategory(req, res) {
  const c = await Category.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ message: "Not found" });
  res.json({ success: true });
}
