/** @type {import('tailwindcss').Config} */
export default {

  darkMode: "class", // ✅ ADD THIS LINE

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      animation: {
        scroll: "scroll 25s linear infinite",
        shine: "shine 8s infinite linear",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shine: {
          "0%": { transform: "translateX(-200%) rotate(45deg)" },
          "100%": { transform: "translateX(200%) rotate(45deg)" },
        },
      },
    },
  },

  plugins: [],
}