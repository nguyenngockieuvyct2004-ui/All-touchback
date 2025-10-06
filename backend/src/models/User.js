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
    phone: String,
    links: [{ label: String, url: String }],
    address: String,
  },
  { timestamps: true }
);

export default model("User", userSchema);
