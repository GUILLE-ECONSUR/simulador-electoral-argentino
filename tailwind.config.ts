import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "azul-noche": "#011A51",
        "azul-vivido": "#0033FA",
        "azul-pastel": "#7CA3FF",
        "gris-suave": "#D5D5D5",
        "gris-intenso": "#454544",
      },
      backgroundImage: {
        "gradient-azul": "linear-gradient(135deg, #011A51 0%, #0033FA 55%, #7CA3FF 100%)",
        "gradient-azul-suave": "linear-gradient(135deg, #0033FA 0%, #7CA3FF 100%)",
        "gradient-gris": "linear-gradient(135deg, #D5D5D5 0%, #454544 100%)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(1, 26, 81, 0.35)",
        glow: "0 0 0 4px rgba(124, 163, 255, 0.25)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "pulse-soft": "pulse-soft 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
