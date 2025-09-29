import { GoogleGenerativeAI } from "@google/generative-ai";

// Prefer a widely available alias. If env uses an older name, map it.
const RAW_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MODEL =
  RAW_MODEL === "gemini-1.5-flash" ? "gemini-1.5-flash-latest" : RAW_MODEL;

// Cache a working selection to reduce latency after first success
let CACHED_SELECTION = null; // { model, api }

export async function chatWithAi(req, res, next) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return res.status(500).json({ message: "Server missing GEMINI_API_KEY" });

    const { messages } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages[] required" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Convert history to Gemini contents format (assistant -> model)
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : m.role || "user",
      parts: [{ text: String(m.content || "") }],
    }));

    // Build candidate list: prioritize 2.5-flash first as requested
    const baseCandidates = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.5-flash-001",
      MODEL,
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro-latest",
      "gemini-1.0-pro-latest",
    ];
    const candidates = Array.from(new Set(baseCandidates));

    const apis = ["v1", "v1beta"]; // prefer v1, fallback to v1beta
    let lastErr;

    // Try cached selection first
    if (CACHED_SELECTION) {
      try {
        const m = genAI.getGenerativeModel(
          { model: CACHED_SELECTION.model },
          { apiVersion: CACHED_SELECTION.api }
        );
        const result = await m.generateContent({ contents });
        const text = result?.response?.text?.() || "";
        return res.json({
          reply: text,
          model: CACHED_SELECTION.model,
          api: CACHED_SELECTION.api,
          cached: true,
        });
      } catch (e) {
        // Invalidate cache and proceed to probing
        CACHED_SELECTION = null;
        lastErr = e;
      }
    }

    for (const api of apis) {
      for (const name of candidates) {
        try {
          const m = genAI.getGenerativeModel(
            { model: name },
            { apiVersion: api }
          );
          const result = await m.generateContent({ contents });
          const text = result?.response?.text?.() || "";
          CACHED_SELECTION = { model: name, api };
          return res.json({ reply: text, model: name, api });
        } catch (e) {
          lastErr = e;
        }
      }
    }
    throw lastErr;
  } catch (err) {
    // Normalize and surface a friendly error
    const status = err?.response?.status || 500;
    const detail = err?.response?.data || err?.message || String(err);
    const message =
      status === 404
        ? `Model không khả dụng cho API hiện tại. Hãy thử đặt GEMINI_MODEL=gemini-1.5-flash-latest (hiện tại: ${MODEL}).`
        : "Gemini API gặp lỗi, vui lòng thử lại.";
    return res.status(status).json({ message, detail });
  }
}

// GET /chat/models - tiện ích chẩn đoán: liệt kê models khả dụng theo API v1 và v1beta
export async function listAvailableModels(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return res.status(500).json({ message: "Server missing GEMINI_API_KEY" });
    const fetchJson = async (url) => {
      const r = await fetch(`${url}?key=${apiKey}`);
      const j = await r.json();
      return { status: r.status, body: j };
    };
    const [v1, v1beta] = await Promise.all([
      fetchJson("https://generativelanguage.googleapis.com/v1/models"),
      fetchJson("https://generativelanguage.googleapis.com/v1beta/models"),
    ]);
    res.json({ v1, v1beta });
  } catch (e) {
    res.status(500).json({ message: "List models failed", detail: e.message });
  }
}
