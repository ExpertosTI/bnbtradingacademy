import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        panel: "#0b1730",
        cream: "#f4f7fb",
        mute: "#93a4bd",
        gold: "#4c9fff",
        gold2: "#d7e8ff",
        good: "#3ddc97",
        bad: "#ff5d6c",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        serif: ["Manrope", "sans-serif"],
        mono: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        desk: "0 30px 80px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
