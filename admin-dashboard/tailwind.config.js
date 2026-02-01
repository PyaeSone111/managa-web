/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Subdued Gradient Backgrounds Palette
        'silver-grass': '#C6CEC5',      // Very light grayish-green
        'bamboo-shoot': '#A4B4A4',      // Medium-light grayish-green
        'paradise-found': '#83958B',    // Medium grayish-green
        'bracken-green': '#627160',     // Darker, muted green
        'bracken-fern': '#30463D',      // Deep, rich green
        'deep-slate-green': '#0D2625',  // Very dark green, almost black
      },
    },
  },
  plugins: [],
}

