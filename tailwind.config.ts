import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c0b0a",
        panel: "#141210",
        cream: "#f6f1e7",
        mute: "#a3988c",
        gold: "#c6a36a",
        gold2: "#ead9b4",
        good: "#c6a36a",
        bad: "#d37b7b",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
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
