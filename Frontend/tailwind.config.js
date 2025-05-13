// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      rotate: {
        '15': '15deg',
        '20': '20deg',
        '25': '25deg',
        '-15': '-15deg',
        '-20': '-20deg',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}