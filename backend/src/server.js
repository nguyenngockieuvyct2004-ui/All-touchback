import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => console.log("> Server running on port", PORT));
  } catch (e) {
    console.error("Failed to start server", e);
    process.exit(1);
  }
}

start();
