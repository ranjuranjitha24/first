/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B1020',
        surface: '#111827',
        surfaceHover: '#1E293B',
        border: '#334155',
        primary: {
          DEFAULT: '#0ea5e9', // cyan-blue
          light: '#38bdf8',
          dark: '#0284c7',
          dim: '#94a3b8',
          glow: 'rgba(14, 165, 233, 0.15)'
        },
        brand: {
          cyan: '#0ea5e9',
          teal: '#14b8a6',
          slate: '#475569',
          green: '#10b981',
          red: '#ef4444',
          orange: '#f59e0b'
        },
        text: {
          main: '#f8fafc',
          muted: '#94a3b8',
          dark: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 255, 255, 0.03)',
        'glow-primary': '0 0 20px rgba(14, 165, 233, 0.15)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.2)',
        'soft': '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
