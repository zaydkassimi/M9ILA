import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#CC0000",
        "flame-orange": "#FF6600",
        "flame-yellow": "#FFD700",
        "brand-bg": "#FFCC00",
        dark: "#1A1A1A",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        tajawal: ["var(--font-tajawal)", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      keyframes: {
        flame: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
      },
      animation: {
        flame: "flame 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
