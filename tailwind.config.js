/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#f5f7fb',
        mist: '#a4adbc',
        rail: '#2d3442',
        gold: '#f5c85c',
        night: '#090b11',
        panel: '#101520',
      },
      fontFamily: {
        display: ['"Segoe UI Variable Display"', 'Aptos', '"Trebuchet MS"', 'sans-serif'],
        mono: ['"Cascadia Code"', '"SFMono-Regular"', '"Roboto Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        glow: '0 24px 80px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}
