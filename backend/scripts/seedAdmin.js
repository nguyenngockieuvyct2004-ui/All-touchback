import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/User.js";

dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/touchback";
  await mongoose.connect(uri);
  const email = process.argv[2] || "admin@example.com";
  const pwd = process.argv[3] || "Admin@12345";
  let u = await User.findOne({ email });
  if (!u) {
    const passwordHash = await bcrypt.hash(pwd, 10);
    u = await User.create({
      fullName: "Admin",
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    });
    console.log("Created admin:", email, "password=", pwd);
  } else {
    console.log("Admin exists:", email);
  }
  await mongoose.disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
