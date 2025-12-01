import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config that accepts all hosts (works with Ngrok)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all addresses so Ngrok can reach it
    port: 5173, // default Vite port
    allowedHosts: true, // allow any host (Vite >= 5.1)
    proxy: {
      "/api": {
        target: "http://localhost:4100",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
      // NEW: proxy uploads để dùng https://<ngrok-frontend>/uploads/...
      "/uploads": {
        target: "http://localhost:4100",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: { protocol: "wss", clientPort: 443 }, // Optional: make HMR stable when proxied via HTTPS (Ngrok)
  },
});
