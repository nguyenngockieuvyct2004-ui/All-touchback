import { Schema, model, Types } from "mongoose";

const nfcCardSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    slug: { type: String, unique: true, required: true },
    title: String,
    linkedMemoryIds: [{ type: Types.ObjectId, ref: "Memory" }],
    isActive: { type: Boolean, default: true },
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
