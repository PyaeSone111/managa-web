/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Navy, Almond, Red-orange, Mango palette */
        navy: '#1e3d59',
        almond: '#f5f0e1',
        'red-orange': '#ff6e40',
        mango: '#ffc13b',
        /* Legacy aliases (keep class names working across the app) */
        quarzo: '#f5f0e1',
        'dockside-blue': '#ddd0b8',
        'sidewalk-grey': '#6b8494',
        'ruskin-blue': '#1e3d59',
        'delta-green': '#ff6e40',
        'black-feather': '#1e3d59',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
