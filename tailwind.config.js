/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff9ecd',
        'primary-light': '#ffe5f2',
        'primary-bg': '#fff5f9',
        'text-dark': '#2d3033',
        'text-medium': '#6c7781',
        'success': '#00c48c',
        'warning': '#ffb800',
        'error': '#ff4b4b',
      },
      boxShadow: {
        'primary': '0px 4px 12px rgba(255, 158, 205, 0.3)',
        'card': '0px 8px 24px rgba(255, 158, 205, 0.15)',
      },
      borderRadius: {
        'default': '12px',
        'large': '24px',
      },
    },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'Roboto', 'Helvetica', 'sans-serif'],
    },
  },
  plugins: [],
}