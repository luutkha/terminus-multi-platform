export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f6f6f6',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#a3a3a3',
          400: '#858585',
          500: '#666666',
          600: '#4d4d4d',
          700: '#3c3c3c',
          800: '#2d2d2d',
          900: '#252526',
          950: '#1e1e1e',
        }
      }
    },
  },
  plugins: [],
}
