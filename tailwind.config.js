/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mine: {
          950: '#0b0f17',
          900: '#0f172a',
          850: '#141d33',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          accent: '#06b6d4', // cyan-500
          'accent-glow': '#22d3ee',
          hazard: '#ef4444',
          warning: '#f59e0b',
          safe: '#10b981',
          subsidence: '#8b5cf6',
          landslide: '#f97316'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    },
  },
  plugins: [],
}
