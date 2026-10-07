import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1917",
        panel: "#fffcf7",
        cream: "#1c1917",
        mute: "#5c564e",
        gold: "#1f4b3a",
        gold2: "#1c1917",
        good: "#1f4b3a",
        bad: "#9f1239",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        serif: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        desk: "0 30px 80px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
