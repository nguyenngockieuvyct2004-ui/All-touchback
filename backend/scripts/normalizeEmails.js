#!/usr/bin/env node
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/touchback";
  await mongoose.connect(uri);
  const users = await User.find({ email: { $exists: true, $ne: null } });
  let updated = 0;
  let duplicates = 0;
  const map = new Map();
  for (const u of users) {
    const lower = u.email.trim().toLowerCase();
    if (u.email !== lower) {
      u.email = lower;
      await u.save();
      updated++;
      console.log("[normalize] updated", u._id.toString(), "=>", lower);
    }
    if (map.has(lower)) {
      console.warn(
        "[normalize] potential duplicate after normalization:",
        lower,
        map.get(lower),
        u._id.toString()
      );
      duplicates++;
    } else map.set(lower, u._id.toString());
  }
  console.log(
    `Done. Updated: ${updated}. Potential duplicates: ${duplicates}. Total users: ${users.length}`
  );
  await mongoose.disconnect();
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
