import Memory from "../models/Memory.js";
import Joi from "joi";
import { generateSlug } from "../utils/generateSlug.js";
import { mapMediaToRelative, toRelativeIfUpload } from "../utils/urls.js";

const mediaItem = Joi.object({
  // Thêm 'audio' để làm nhạc nền trong public page
  type: Joi.string().valid("image", "video", "audio").required(),
  // Chấp nhận cả URL tuyệt đối lẫn đường dẫn tương đối
  url: Joi.string().min(1).required(),
  caption: Joi.string().allow("", null),
});

const createSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow("", null),
  media: Joi.array().items(mediaItem).max(20).default([]),
  // Cho phép đường dẫn tương đối để hoạt động tốt với proxy/ngrok
  coverImageUrl: Joi.string().allow("", null),
  bgAudioUrl: Joi.string().allow("", null),
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
    // Normalize any upload URLs to relative paths
    data.media = mapMediaToRelative(data.media);
    if (data.coverImageUrl)
      data.coverImageUrl = toRelativeIfUpload(data.coverImageUrl);
    if (data.bgAudioUrl) data.bgAudioUrl = toRelativeIfUpload(data.bgAudioUrl);
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
    // Normalize relative paths on update as well
    if (data.media) data.media = mapMediaToRelative(data.media);
    if (data.coverImageUrl)
      data.coverImageUrl = toRelativeIfUpload(data.coverImageUrl);
    if (data.bgAudioUrl) data.bgAudioUrl = toRelativeIfUpload(data.bgAudioUrl);
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
  // Deletion of memories is disabled by product policy; use resetMemory instead
  return res.status(405).json({
    message:
      "Xoá memories đã bị vô hiệu hoá. Vui lòng dùng 'Reset as default'.",
  });
}

export async function resetMemory(req, res, next) {
  try {
    // Reset selected fields back to default/empty while keeping id and slug
    const update = {
      $set: {
        title: "My Memory",
        description: "",
        media: [],
        galleryStyle: "grid",
        tags: [],
        isPublic: true,
      },
      $unset: {
        coverImageUrl: "",
        bgAudioUrl: "",
      },
    };
    const updated = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

// ---------------- Lost mode (Active/Lost) ----------------
// Schema validate payload cho chế độ Lost
const lostSchema = Joi.object({
  isLost: Joi.boolean().required(),
  title: Joi.string().allow("", null).default(""),
  message: Joi.string().allow("", null).default(""),
  contact: Joi.object({
    name: Joi.string().allow("", null).default(""),
    phone: Joi.string().allow("", null).default(""),
    email: Joi.string().email({ tlds: false }).allow("", null).default(""),
  }).default({}),
}).unknown(false);

// API: PATCH /memories/:id/lost - Bật/tắt và cấu hình nội dung Lost cho Memory
export async function updateLostMemory(req, res, next) {
  try {
    const data = await lostSchema.validateAsync(req.body || {}, {
      stripUnknown: true,
    });
    const mem = await Memory.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!mem) return res.status(404).json({ message: "Not found" });
    mem.lost = {
      isLost: !!data.isLost,
      title: data.title || "",
      message: data.message || "",
      contact: {
        name: data.contact?.name || "",
        phone: data.contact?.phone || "",
        email: data.contact?.email || "",
      },
      updatedAt: new Date(),
    };
    await mem.save();
    res.json(mem);
  } catch (e) {
    next(e);
  }
}
