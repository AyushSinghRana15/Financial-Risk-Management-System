/** @type {import('tailwindcss').Config} */
export default {

  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      animation: {
        scroll: "scroll 25s linear infinite",
        float: "float 6s ease-in-out infinite",
        shine: "shine 8s infinite linear",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        shine: {
          "0%": { transform: "translateX(-100%) rotate(25deg)" },
          "100%": { transform: "translateX(200%) rotate(25deg)" },
        },
      },
    },
  },

  plugins: [],
}