const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EEEBDD",
        secondary: "#810000",
        accent: "#630000",
        dark: "#1B1717",
        colour1: "#800000",
        colour2: "#600000",
        colour3: "#400000",
        colour4: "#A00000"
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}