import mongoose from "mongoose";
import dotenv from "dotenv";
import Memory from "../src/models/Memory.js";
import Product from "../src/models/Product.js";
import User from "../src/models/User.js";
import NfcCard from "../src/models/NfcCard.js";
import { mapMediaToRelative, toUploadRelative } from "../src/utils/urls.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/touchback";

async function run() {
  await mongoose.connect(MONGO_URI);
  let changed = 0;

  // Memories: media[].url, coverImageUrl, bgAudioUrl
  const mems = await Memory.find({}).lean();
  for (const m of mems) {
    const next = {
      media: mapMediaToRelative(m.media),
      coverImageUrl: toUploadRelative(m.coverImageUrl),
      bgAudioUrl: toUploadRelative(m.bgAudioUrl),
    };
    const dif =
      JSON.stringify(next.media) !== JSON.stringify(m.media) ||
      next.coverImageUrl !== m.coverImageUrl ||
      next.bgAudioUrl !== m.bgAudioUrl;
    if (dif) {
      await Memory.updateOne({ _id: m._id }, { $set: next });
      changed++;
    }
  }

  // Products: images[]
  const prods = await Product.find({}).lean();
  for (const p of prods) {
    const imgs = Array.isArray(p.images)
      ? p.images.map((u) => toUploadRelative(u))
      : p.images;
    if (JSON.stringify(imgs) !== JSON.stringify(p.images)) {
      await Product.updateOne({ _id: p._id }, { $set: { images: imgs } });
      changed++;
    }
  }

  // Users: profile.avatar, profile.cover
  const users = await User.find({}).lean();
  for (const u of users) {
    const prof = u.profile || {};
    const next = {
      "profile.avatar": toUploadRelative(prof.avatar),
      "profile.cover": toUploadRelative(prof.cover),
    };
    const dif =
      next["profile.avatar"] !== prof.avatar ||
      next["profile.cover"] !== prof.cover;
    if (dif) {
      await User.updateOne({ _id: u._id }, { $set: next });
      changed++;
    }
  }

  // NfcCards: profile.avatar, profile.cover
  const cards = await NfcCard.find({}).lean();
  for (const c of cards) {
    const prof = c.profile || {};
    const next = {
      "profile.avatar": toUploadRelative(prof.avatar),
      "profile.cover": toUploadRelative(prof.cover),
    };
    const dif =
      next["profile.avatar"] !== prof.avatar ||
      next["profile.cover"] !== prof.cover;
    if (dif) {
      await NfcCard.updateOne({ _id: c._id }, { $set: next });
      changed++;
    }
  }

  console.log(`Normalized ${changed} documents.`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
