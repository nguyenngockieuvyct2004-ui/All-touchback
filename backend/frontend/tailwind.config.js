/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e9ff",
          200: "#b3d3ff",
          300: "#84b9ff",
          400: "#4693ff",
          500: "#2563eb",
          600: "#1d4fd8",
          700: "#1d43ad",
          800: "#1e3a8a",
          900: "#1e335f",
        },
      },
      boxShadow: {
        soft: "0 2px 6px -1px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.06)",
        glow: "0 0 0 3px rgba(37,99,235,0.35)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        fade: "fade 0.35s ease",
        slide: "slideUp 0.4s ease",
      },
      keyframes: {
        fade: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slide: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("hocus", ["&:hover", "&:focus-visible"]);
    },
  ],
};
