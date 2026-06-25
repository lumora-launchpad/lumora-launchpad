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
          blue: "#0052ff",
          sky: "#3b82f6",
          violet: "#7c3aed",
          pink: "#ec4899",
          mint: "#10b981",
        },
        ink: "#0b1020",
        cloud: "#f6f8ff",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px -20px rgba(59, 130, 246, 0.45)",
        card: "0 10px 40px -15px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(120deg, #0052ff 0%, #7c3aed 45%, #ec4899 100%)",
        "soft-radial":
          "radial-gradient(1200px 600px at 10% -10%, rgba(124,58,237,0.18), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(236,72,153,0.16), transparent)",
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
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        marquee: "marquee 40s linear infinite",
        rise: "rise 0.4s ease-out both",
        flash: "flash 1.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
