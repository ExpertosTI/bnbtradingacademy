import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09090b",
        panel: "#121214",
        cream: "#f3efe4",
        mute: "#a39e93",
        gold: "#c6a15b",
        gold2: "#e7d3a1",
        good: "#8fd0a8",
        bad: "#e07a6a",
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        serif: ["Fraunces", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        desk: "0 30px 80px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
