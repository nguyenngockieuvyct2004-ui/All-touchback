import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    fullName: String,
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: String,
    provider: { type: String, default: "local" },
    googleId: String,
    // Password reset fields
    resetPasswordTokenHash: String,
    resetPasswordExpires: Date,
    role: {
      type: String,
      enum: ["admin", "manager", "customer"],
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
    phone: String,
    links: [{ label: String, url: String }],
    address: String,
    // Business card style profile to prefill NFC wizard
    profile: {
      avatar: String,
      cover: String,
      name: String,
      title: String,
      company: String,
      phone: String,
      email: String,
      website: String,
      address: String,
      socials: [{ label: String, url: String }],
    },
  },
  { timestamps: true }
);

export default model("User", userSchema);
