import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authRequired } from "../middleware/auth.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadRoot);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]+/g, "-");
    const stamp = Date.now();
    cb(null, `${base}-${stamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 10, // max files per request
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/ogg",
      // Cho phép audio làm nhạc nền
      "audio/mpeg",
      "audio/mp3",
      "audio/ogg",
      "audio/wav",
      "audio/webm",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type"));
  },
});

// POST /upload
// Form-data: files[] (multiple)
router.post("/", authRequired, upload.array("files"), (req, res) => {
  // Always return relative paths so clients can use current origin (works with proxies/Ngrok)
  const files = (req.files || []).map((f) => ({
    url: `/uploads/${f.filename}`,
    type: f.mimetype.startsWith("image/")
      ? "image"
      : f.mimetype.startsWith("video/")
      ? "video"
      : "audio",
    originalName: f.originalname,
    size: f.size,
  }));
  res.json({ files });
});

export default router;
