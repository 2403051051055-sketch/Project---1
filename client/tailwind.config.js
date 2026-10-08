/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        darkCard: '#131b2e',
        darkBorder: 'rgba(255, 255, 255, 0.08)',
        accentPrimary: '#38bdf8',
        accentHover: '#0284c7',
      },
    },
  },
  plugins: [],
}
