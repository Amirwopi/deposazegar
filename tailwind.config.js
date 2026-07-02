/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./scripts/generate-pages.js",
    "./data/**/*.{js,json}",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'depo-dark': '#0F2742',
        'depo-blue': '#15547D',
        'depo-container': '#1D6FA5',
        'depo-orange': '#F59E0B',
        'depo-gray': '#F8FAFC',
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
