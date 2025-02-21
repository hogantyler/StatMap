/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    // Scan all JS/JSX/TS/TSX files:
    "./src/**/*.{js,jsx,ts,tsx}",

    // Include HTML files (if any):
    "./public/**/*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#202225',
        secondary: '#5865f2',
      }
      
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

