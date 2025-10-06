import axios from "axios";

const resolvedBase = import.meta.env.VITE_API_BASE || "http://localhost:4100";
const api = axios.create({
  baseURL: resolvedBase,
});
if (import.meta.env.DEV) {
  // Debug base URL once in dev
  console.log("[API] baseURL=", resolvedBase);
}

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload?.exp && payload.exp <= now) {
        // Token expired: clear and redirect to login with flag
        try {
          localStorage.removeItem("jwt");
        } catch {}
        if (typeof window !== "undefined" && window.location) {
          const url = new URL(window.location.href);
          url.pathname = "/login";
          url.searchParams.set("expired", "1");
          window.location.assign(url.toString());
        }
      } else {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If decode fails, fall back to sending token (server will validate)
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  }
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      try {
        localStorage.removeItem("jwt");
      } catch {}
      // Redirect to login once on 401
      if (
        typeof window !== "undefined" &&
        window.location &&
        !window.location.pathname.startsWith("/login")
      ) {
        const url = new URL(window.location.href);
        url.pathname = "/login";
        url.searchParams.set("expired", "1");
        window.location.assign(url.toString());
      }
    }
    return Promise.reject(err);
  }
);

export default api;
