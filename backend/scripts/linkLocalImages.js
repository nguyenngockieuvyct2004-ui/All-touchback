// Script: Gắn 4 ảnh local trong frontend/public/images vào 4 sản phẩm hiện có
// Ưu tiên map theo số hiệu trong tên (001..004). Nếu không tìm thấy, sẽ gán lần lượt theo thời gian tạo (cũ -> mới).

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";

dotenv.config();

const FRONTEND_IMAGES_DIR = path.resolve(
  process.cwd(),
  "frontend",
  "public",
  "images"
);

function ensureImages() {
  if (!fs.existsSync(FRONTEND_IMAGES_DIR)) {
    throw new Error(`Không tìm thấy thư mục ảnh: ${FRONTEND_IMAGES_DIR}`);
  }
  const files = fs
    .readdirSync(FRONTEND_IMAGES_DIR)
    .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
    .slice(0, 4);
  if (files.length < 4) {
    console.warn(
      `Chỉ tìm thấy ${files.length} ảnh. Vẫn tiếp tục gắn theo thứ tự hiện có.`
    );
  }
  return files;
}

function numberFromName(s) {
  const m = s.match(/(\d{3,4})/); // bắt '001','002','003','004', hoặc 4 số
  return m ? m[1] : null;
}

async function run() {
  const images = ensureImages();
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/touchback";
  await mongoose.connect(uri);
  console.log("> Đã kết nối MongoDB, bắt đầu gắn ảnh…");

  // Lấy tối đa 4 sản phẩm (ưu tiên map theo số hiệu nếu có)
  const all = await Product.find({}).sort({ createdAt: 1 });
  if (all.length === 0) {
    console.log("! Chưa có sản phẩm nào trong DB");
    await mongoose.disconnect();
    return;
  }

  // Tạo bảng map: key = số hiệu (001..004) -> filename
  const mapByNo = new Map();
  for (const file of images) {
    const no = numberFromName(file);
    if (no) mapByNo.set(no, file);
  }

  const updates = [];

  // 1) Thử map theo số hiệu xuất hiện trong tên sản phẩm
  for (const [no, file] of mapByNo.entries()) {
    const p = all.find((x) => new RegExp(no).test(x.name));
    if (p) {
      const url = `/images/${file}`; // dùng đường dẫn tương đối để FE Vite serve
      updates.push({ _id: p._id, code: p.code, name: p.name, images: [url] });
    }
  }

  // 2) Với các ảnh còn lại hoặc không khớp số hiệu, map theo thứ tự
  const usedIds = new Set(updates.map((u) => String(u._id)));
  const leftFiles = images.filter(
    (f) => !updates.some((u) => u.images[0].endsWith(f))
  );
  let i = 0;
  for (const p of all) {
    if (updates.length >= images.length) break;
    if (usedIds.has(String(p._id))) continue;
    const file = leftFiles[i++];
    if (!file) break;
    const url = `/images/${file}`;
    updates.push({ _id: p._id, code: p.code, name: p.name, images: [url] });
  }

  if (updates.length === 0) {
    console.log("! Không có sản phẩm nào để cập nhật");
  } else {
    for (const u of updates.slice(0, 4)) {
      await Product.updateOne({ _id: u._id }, { $set: { images: u.images } });
      console.log(`~ Gán ảnh ${u.images[0]} -> ${u.name} (${u.code})`);
    }
  }

  await mongoose.disconnect();
  console.log("> Hoàn tất");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
