/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    // Scan all JS/JSX/TS/TSX files:
    "./src/**/*.{js,jsx,ts,tsx}",

    // Include HTML files (if any):
    "./public/**/*.html"
  ],
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

