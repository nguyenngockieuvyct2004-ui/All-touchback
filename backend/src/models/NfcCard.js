import { Schema, model, Types } from "mongoose";

const nfcCardSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    slug: { type: String, unique: true, required: true },
    title: String,
    linkedMemoryIds: [{ type: Types.ObjectId, ref: "Memory" }],
    // Legacy active flag (kept for backward compat). Use 'status' for new flow
    isActive: { type: Boolean, default: true },
    // Commercial flow additions
    status: {
      type: String,
      enum: ["unactivated", "active", "disabled"],
      default: "active",
      index: true,
    },
    orderId: { type: Types.ObjectId, ref: "Order", index: true },
    productId: { type: Types.ObjectId, ref: "Product", index: true },
    productCode: { type: String },
    activationCode: { type: String, index: true }, // used for gift/claim
    tagUid: { type: String, unique: true, sparse: true }, // NFC chip UID
    // Optional business card profile for public card page
    profile: {
      name: String,
      title: String,
      company: String,
      phone: String,
      email: String,
      website: String,
      address: String,
      avatar: String, // URL to avatar image
      cover: String, // URL to cover image
      socials: [
        new Schema(
          {
            label: String, // e.g., Facebook, LinkedIn
            url: String,
          },
          { _id: false }
        ),
      ],
    },
    // Prefer this memory when rendering public card
    primaryMemoryId: { type: Types.ObjectId, ref: "Memory" },
  },
  { timestamps: true }
);

export default model("NfcCard", nfcCardSchema);
