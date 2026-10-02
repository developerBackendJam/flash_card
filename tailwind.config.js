/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f6',
          100: '#fce7f0',
          200: '#fad0e3',
          300: '#f6a9cc',
          600: '#9d174d',
          700: '#831843',
          800: '#68183c',
          900: '#541532',
          950: '#38091f',
        },
        cream: {
          50: '#fdfbf9',
          100: '#faf5f0',
          200: '#f5ebe0',
          300: '#eddcd0',
        },
        brand: {
          primary: '#6d1844',
          hover: '#571135',
          dark: '#480d2b',
          accent: '#821f52',
          cream: '#fdf0e6',
          border: '#e5e7eb',
          textMuted: '#6b7280',
          inputBg: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
