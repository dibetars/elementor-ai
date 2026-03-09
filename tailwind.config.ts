import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },
      colors: {
        // Light mode — matched to ElementBuddy logo
        ink: "#FFFFFF",
        surface: "#F4F8FF",       // light blue-gray tint
        panel: "#FFFFFF",          // card bg
        border: "#DDE6F5",         // soft border
        muted: "#8EA3C9",          // muted text
        subtle: "#4B5D80",         // secondary text
        text: "#0D1F40",           // primary dark navy
        accent: "#1B3566",         // navy — logo primary
        "accent-dim": "#132748",   // darker navy
        teal: "#2DD4BF",           // teal — logo highlight
        "teal-dim": "#1FB5A3",     // deeper teal
        success: "#10B981",
        warning: "#F59E0B",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s ease infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(13,31,64,0.06), 0 4px 16px rgba(13,31,64,0.06)",
        "card-hover": "0 4px 8px rgba(13,31,64,0.08), 0 12px 32px rgba(13,31,64,0.1)",
        cta: "0 8px 32px rgba(27,53,102,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
