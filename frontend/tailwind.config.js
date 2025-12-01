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
        // Softer brand palette leaning towards the warm neutral hero in the mock
        brand: {
          50: "#f3f6ff",
          100: "#e7eeff",
          200: "#cfe0ff",
          300: "#aecdff",
          400: "#7fb1ff",
          500: "#4f8dff",
          600: "#2563eb",
          700: "#1e49c9",
          800: "#1f3a8a",
          900: "#182b63",
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
