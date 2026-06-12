import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "city-bg": "#0a0a0f",
        "city-surface": "#12131a",
        "city-border": "#1e2030",
        "city-text": "#e8eaf0",
        "city-muted": "#6b7280",
        "category-safety": "#ef4444",
        "category-events": "#3b82f6",
        "category-traffic": "#f59e0b",
        "category-civic": "#22c55e",
      },
      animation: {
        "pulse-ring": "pulse-ring 2.5s ease-out infinite",
        "pulse-ring-fast": "pulse-ring 1s ease-out infinite",
        "poi-glow": "poi-glow 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "poi-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59,130,246,0.5)" },
          "50%": { boxShadow: "0 0 0 8px rgba(59,130,246,0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
