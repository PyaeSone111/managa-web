/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Navy, Almond, Red-orange, Mango palette (matches frontend) */
        navy: '#1e3d59',
        almond: '#f5f0e1',
        'red-orange': '#ff6e40',
        mango: '#ffc13b',
        'dockside-blue': '#ddd0b8',
        'sidewalk-grey': '#6b8494',
        'ruskin-blue': '#1e3d59',
        'delta-green': '#ff6e40',
        'black-feather': '#1e3d59',
        /* Admin legacy aliases */
        bonaire: '#ffffff',
        'torrefacto-roast': '#1e3d59',
        'stone-lion': '#6b8494',
        'indiana-clay': '#ff6e40',
        primary: {
          50: '#f5f0e1',
          100: '#ede4d0',
          200: '#ddd0b8',
          300: '#c4b8a0',
          400: '#ff6e40',
          500: '#ff6e40',
          600: '#ff6e40',
          700: '#e55a2b',
          800: '#1e3d59',
          900: '#162e44',
        },
      },
    },
  },
  plugins: [],
};
