/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ethiopia: {
          green: "#009A44",
          yellow: "#FED100",
          red: "#EF3340",
          blue: "#0F47AF"
        },
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Ethiopic', 'sans-serif'],
        ethiopic: ['Noto Sans Ethiopic', 'Abyssinica SIL', 'sans-serif']
      }
    },
  },
  plugins: [],
}
