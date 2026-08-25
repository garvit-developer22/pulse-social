/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pulse: {
          bg: '#0b0f19',
          card: '#121826',
          line: '#1f2937',
          text: '#f3f4f6',
          muted: '#9ca3af',
          accent: '#8b5cf6',
          accent2: '#22d3ee',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(139, 92, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
