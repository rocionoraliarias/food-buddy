/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5ed',
          100: '#ffe7d1',
          200: '#ffcaa1',
          300: '#ffa768',
          400: '#ff7f35',
          500: '#f15e17',
          600: '#e0470f',
          700: '#b9340f',
          800: '#932b13',
          900: '#762612',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
