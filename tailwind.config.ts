import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050506",
        panel: "#0a0a0c",
        cream: "#f2f2f2",
        mute: "#8d8d96",
        gold: "#d4d4d8",
        gold2: "#fafafa",
        good: "#3ddc97",
        bad: "#ff5d5d",
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
