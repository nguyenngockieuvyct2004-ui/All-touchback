import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function main() {
  const key = process.env.GEMINI_API_KEY;
  const modelPref = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
  console.log("Using key set:", !!key, "modelPref:", modelPref);
  const genAI = new GoogleGenerativeAI(key);
  const models = [
    modelPref,
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro-latest",
    "gemini-1.0-pro-latest",
    "gemini-1.0-pro",
  ];
  const apis = ["v1", "v1beta"];
  for (const apiVersion of apis) {
    console.log("\n=== Trying API", apiVersion, "===");
    for (const m of models) {
      try {
        console.log("Trying model:", m);
        const gm = genAI.getGenerativeModel({ model: m }, { apiVersion });
        const r = await gm.generateContent({
          contents: [{ role: "user", parts: [{ text: "Hi" }] }],
        });
        console.log("OK", apiVersion, "model:", m, "reply:", r.response.text());
        process.exit(0);
      } catch (e) {
        const status = e?.status || e?.response?.status;
        console.log("Error", apiVersion, "model", m, "status", status);
      }
    }
  }
  console.log("All candidates failed");
  process.exit(2);
}
main().catch((e) => {
  console.error("Fatal", e);
  process.exit(1);
});
