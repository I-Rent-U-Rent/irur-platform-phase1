/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // Primary light blue
          600: '#1d4ed8', // Hover blue
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
        },
        slate: {
          850: '#111820',
          900: '#0B0F14',
          950: '#070A0E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 4px 20px rgba(15, 23, 42, 0.05)',
        'subtle-lg': '0 10px 30px rgba(15, 23, 42, 0.08)',
        'dark-card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
