import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 如果你的设计里用了 slate 以外的颜色，可以在这里加，
      // 但默认情况下 Tailwind 已经包含了所有 slate/blue 颜色。
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;