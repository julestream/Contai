/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: {
          DEFAULT: "#f5f3ef",
          mid: "#e8e4dc",
          dark: "#d8d4cc",
        },
        ink: {
          DEFAULT: "#0a0a0a",
          mid: "#444444",
          muted: "#999999",
          faint: "#cccccc",
        },
        verified: {
          DEFAULT: "#2d6a4f",
          bg: "#eef4f1",
        },
        danger: {
          DEFAULT: "#b94040",
          bg: "#fdf0f0",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
