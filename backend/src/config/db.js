import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log("Database connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
