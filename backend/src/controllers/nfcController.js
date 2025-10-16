import NfcCard from "../models/NfcCard.js";
import Memory from "../models/Memory.js";
import { generateSlug } from "../utils/generateSlug.js";
import Joi from "joi";
import { activateCardByCodeOrTag } from "../services/provisioningService.js";

const linkSchema = Joi.object({
  memoryIds: Joi.array().items(Joi.string()).default([]),
});

export async function createCard(req, res) {
  const slug = generateSlug();
  const card = await NfcCard.create({ userId: req.user.id, slug });
  res.status(201).json(card);
}

export async function listCards(req, res) {
  const cards = await NfcCard.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(cards);
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

const profileSchema = Joi.object({
  name: Joi.string().allow("", null),
  title: Joi.string().allow("", null),
  company: Joi.string().allow("", null),
  phone: Joi.string().allow("", null),
  email: Joi.string().email({ tlds: false }).allow("", null),
  website: Joi.string().uri({ allowRelative: false }).allow("", null),
  address: Joi.string().allow("", null),
  avatar: Joi.string().uri().allow("", null),
  // allow relative or absolute path for cover (no uri constraint)
  cover: Joi.string().allow("", null),
  socials: Joi.array()
    .items(
      Joi.object({
        label: Joi.string().allow("", null),
        url: Joi.string().uri().required(),
      })
    )
    .max(20)
    .default([]),
}).default({});

const updateSchema = Joi.object({
  title: Joi.string().allow("", null),
  isActive: Joi.boolean(),
  profile: profileSchema,
  primaryMemoryId: Joi.string().allow("", null),
}).unknown(false);

export async function updateCard(req, res, next) {
  try {
    const data = await updateSchema.validateAsync(req.body, {
      stripUnknown: true,
    });
    // Support explicit remove cover if client sends profile.cover === "__REMOVE__"
    if (data.profile && data.profile.cover === "__REMOVE__") {
      data.profile.cover = "";
    }
    if (data.primaryMemoryId === "") data.primaryMemoryId = null;
    const updated = await NfcCard.findOneAndUpdate(
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

export async function listCardMemories(req, res, next) {
  try {
    const card = await NfcCard.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!card) return res.status(404).json({ message: "Not found" });
    const memories = await Memory.find({
      _id: { $in: card.linkedMemoryIds || [] },
    })
      .sort({ updatedAt: -1 })
      .select("_id title isPublic updatedAt")
      .lean();
    res.json(
      memories.map((m) => ({
        id: String(m._id),
        title: m.title,
        isPublic: !!m.isPublic,
        updatedAt: m.updatedAt,
      }))
    );
  } catch (e) {
    next(e);
  }
}

export async function resolveSlug(req, res) {
  const card = await NfcCard.findOne({ slug: req.params.slug });
  if (!card) return res.status(404).json({ message: "Not found" });
  if (card.status && card.status !== "active") {
    return res.status(404).json({ message: "Not found" });
  }
  const memories = await Memory.find({
    _id: { $in: card.linkedMemoryIds },
    isPublic: true,
  }).sort({ createdAt: -1 });
  res.json({ card: { slug: card.slug, title: card.title }, memories });
}

export async function activateCard(req, res) {
  const schema = Joi.object({
    activationCode: Joi.string().allow("", null),
    tagUid: Joi.string().allow("", null),
  });
  const { activationCode, tagUid } = await schema.validateAsync(req.body || {});
  try {
    const card = await activateCardByCodeOrTag({
      userId: req.user?.id,
      activationCode,
      tagUid,
    });
    res.json(card);
  } catch (e) {
    res.status(400).json({ message: e.message || "Không kích hoạt được thẻ" });
  }
}
