/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f5ff',
          100: '#dce8ff',
          200: '#b8d0ff',
          300: '#85adff',
          400: '#4d7fe0',
          500: '#2d5fbf',
          600: '#1e4699',
          700: '#1b3d85',
          800: '#162f65',
          900: '#0f1e3d',
          950: '#080f1f',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a84a',
          600: '#b8902f',
          700: '#92701f',
          800: '#78591a',
          900: '#5c4214',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 16px 48px rgba(0,0,0,0.12)',
        'gold': '0 4px 24px rgba(212,168,74,0.35)',
        'gold-lg': '0 8px 32px rgba(212,168,74,0.4)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(15,30,61,0.95) 0%, rgba(27,61,133,0.85) 50%, rgba(15,30,61,0.75) 100%)',
      }
    },
  },
  plugins: [],
};
