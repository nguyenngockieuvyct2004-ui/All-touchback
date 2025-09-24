import NfcCard from "../models/NfcCard.js";
import Memory from "../models/Memory.js";
import { generateSlug } from "../utils/generateSlug.js";
import Joi from "joi";

const linkSchema = Joi.object({
  memoryIds: Joi.array().items(Joi.string()).default([]),
});

export async function createCard(req, res) {
  const slug = generateSlug();
  const card = await NfcCard.create({ userId: req.user.id, slug });
  res.status(201).json(card);
}

export async function linkMemories(req, res, next) {
  try {
    const { memoryIds } = await linkSchema.validateAsync(req.body);
    const card = await NfcCard.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!card) return res.status(404).json({ message: "Not found" });
    card.linkedMemoryIds = memoryIds;
    await card.save();
    res.json(card);
  } catch (e) {
    next(e);
  }
}

export async function resolveSlug(req, res) {
  const card = await NfcCard.findOne({ slug: req.params.slug, isActive: true });
  if (!card) return res.status(404).json({ message: "Not found" });
  const memories = await Memory.find({
    _id: { $in: card.linkedMemoryIds },
    isPublic: true,
  }).sort({ createdAt: -1 });
  res.json({ card: { slug: card.slug, title: card.title }, memories });
}
