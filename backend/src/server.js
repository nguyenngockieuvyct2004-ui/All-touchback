import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => console.log("> Server running on port " + PORT));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
