import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          // Purple brand palette, matching the Lumora logo. The token names are
          // kept so existing classes keep working; only the values changed.
          blue: "#7c3aed",
          sky: "#a855f7",
          violet: "#7c3aed",
          pink: "#d946ef",
          mint: "#10b981",
        },
        ink: "#0b1020",
        cloud: "#f6f8ff",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px -20px rgba(124, 58, 237, 0.45)",
        card: "0 10px 40px -15px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(120deg, #7c3aed 0%, #9333ea 45%, #c026d3 100%)",
        "soft-radial":
          "radial-gradient(1200px 600px at 10% -10%, rgba(124,58,237,0.20), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(192,38,211,0.16), transparent)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flash: {
          "0%": { backgroundColor: "rgba(16,185,129,0.18)" },
          "100%": { backgroundColor: "transparent" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(22px, -26px) scale(1.05)" },
          "66%": { transform: "translate(-18px, 16px) scale(0.97)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.6" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "translateY(-6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        marquee: "marquee 40s linear infinite",
        rise: "rise 0.4s ease-out both",
        flash: "flash 1.2s ease-out",
        drift: "drift 18s ease-in-out infinite",
        "glow-pulse": "glowPulse 7s ease-in-out infinite",
        "pop-in": "popIn 0.16s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
