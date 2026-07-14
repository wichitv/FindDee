/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EXIM Bank Thailand brand colors
        primary: '#034EA2',
        secondary: '#ED1C24',
        // Override sky palette to match EXIM Bank blue tones
        sky: {
          50:  '#F0F6FD',
          100: '#D9E8F7',
          200: '#B0CEEE',
          300: '#7AAFE2',
          400: '#3E8FD4',
          500: '#034EA2',
          600: '#023F87',
          700: '#154194',
          800: '#0F2E73',
          900: '#091D52',
        },
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
