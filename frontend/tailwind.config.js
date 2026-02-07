/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Serene Winter Mountain Lake Palette */
        quarzo: '#C9D0D9',
        'dockside-blue': '#9EB3BC',
        'sidewalk-grey': '#799099',
        'ruskin-blue': '#516D74',
        'delta-green': '#2E4B4E',
        'black-feather': '#0D211F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
