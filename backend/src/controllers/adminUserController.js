import Joi from "joi";
import bcrypt from "bcrypt";
import User from "../models/User.js";

export async function listUsers(_req, res) {
  const users = await User.find().select(
    "fullName email role isActive createdAt"
  );
  res.json(users);
}

export async function createUser(req, res, next) {
  try {
    const schema = Joi.object({
      fullName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      role: Joi.string()
        .valid("admin", "manager", "customer")
        .default("customer"),
      isActive: Joi.boolean().default(true),
    });
    const data = await schema.validateAsync(req.body);
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email đã tồn tại" });
    const passwordHash = await bcrypt.hash(data.password, 10);
    const u = await User.create({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      isActive: data.isActive,
    });
    res
      .status(201)
      .json({
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
      });
  } catch (e) {
    next(e);
  }
}

export async function updateUser(req, res, next) {
  try {
    const schema = Joi.object({
      fullName: Joi.string().optional(),
      role: Joi.string().valid("admin", "manager", "customer").optional(),
      isActive: Joi.boolean().optional(),
      password: Joi.string().min(8).optional(),
    });
    const data = await schema.validateAsync(req.body);
    const update = { ...data };
    if (data.password) {
      update.passwordHash = await bcrypt.hash(data.password, 10);
      delete update.password;
    }
    const u = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!u) return res.status(404).json({ message: "Not found" });
    res.json({
      id: u._id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(req, res) {
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) return res.status(404).json({ message: "Not found" });
  res.json({ success: true });
}

export async function toggleActive(req, res) {
  const schema = Joi.object({ isActive: Joi.boolean().required() });
  const { isActive } = await schema.validateAsync(req.body);
  const u = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );
  if (!u) return res.status(404).json({ message: "Not found" });
  res.json({ id: u._id, isActive: u.isActive });
}
