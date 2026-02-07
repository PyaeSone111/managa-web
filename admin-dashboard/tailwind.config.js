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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Admin white theme
        'bonaire': '#ffffff',
        'torrefacto-roast': '#111827',
        'stone-lion': '#6b7280',
        'indiana-clay': '#2563eb',
        // Legacy palette (kept for any refs)
        'silver-grass': '#6b7280',
        'bamboo-shoot': '#9ca3af',
        'paradise-found': '#6b7280',
        'bracken-green': '#374151',
        'bracken-fern': '#1f2937',
        'deep-slate-green': '#111827',
      },
    },
  },
  plugins: [],
}

