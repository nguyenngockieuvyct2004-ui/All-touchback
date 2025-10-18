import Memory from "../models/Memory.js";
import Joi from "joi";
import { generateSlug } from "../utils/generateSlug.js";

const mediaItem = Joi.object({
  // Thêm 'audio' để làm nhạc nền trong public page
  type: Joi.string().valid("image", "video", "audio").required(),
  url: Joi.string().uri().required(),
  caption: Joi.string().allow("", null),
});

const createSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow("", null),
  media: Joi.array().items(mediaItem).max(20).default([]),
  coverImageUrl: Joi.string().uri().allow("", null),
  bgAudioUrl: Joi.string().uri().allow("", null),
  galleryStyle: Joi.string().valid("grid", "carousel").default("grid"),
  tags: Joi.array().items(Joi.string().min(1)).max(15).default([]),
  isPublic: Joi.boolean().default(true),
  cardId: Joi.string().optional(),
})
  // Accept 'content' from older/newer clients and map it to 'description'
  .rename("content", "description", { ignoreUndefined: true, override: false })
  // Allow unknown keys so we can strip them cleanly without throwing
  .unknown(true);

export async function listMemories(req, res) {
  const list = await Memory.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(list);
}

export async function createMemory(req, res, next) {
  try {
    const data = await createSchema.validateAsync(req.body, {
      stripUnknown: true,
    });
    if (!data.slug) data.slug = generateSlug();
    const memory = await Memory.create({ ...data, userId: req.user.id });
    res.status(201).json(memory);
  } catch (e) {
    next(e);
  }
}

export async function getMemory(req, res) {
  const m = await Memory.findOne({ _id: req.params.id, userId: req.user.id });
  if (!m) return res.status(404).json({ message: "Not found" });
  res.json(m);
}

export async function updateMemory(req, res, next) {
  try {
    const partialSchema = createSchema.fork(
      Object.keys(createSchema.describe().keys),
      (s) => s.optional()
    );
    const data = await partialSchema.validateAsync(req.body, {
      stripUnknown: true,
    });
    // Nếu memory chưa có slug (cũ), tự gán slug mới để chia sẻ công khai
    const prev = await Memory.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!prev) return res.status(404).json({ message: "Not found" });
    if (!prev.slug) {
      data.slug = generateSlug();
    }
    const updated = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      data,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

export async function deleteMemory(req, res) {
  const deleted = await Memory.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ success: true });
}
