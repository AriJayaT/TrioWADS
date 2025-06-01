/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Varela Round"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
        },
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
        }
      },
    },
    plugins: [],
  }