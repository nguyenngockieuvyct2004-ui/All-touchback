import { Schema, model } from "mongoose";

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "closed"], default: "new" },
    meta: { type: Object },
  },
  { timestamps: true }
);

export default model("ContactMessage", contactMessageSchema);
