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
        'card-hover': '0 20px 60px rgba(0,0,0,0.12)',
        'gold': '0 4px 24px rgba(212,168,74,0.35)',
        'gold-lg': '0 8px 32px rgba(212,168,74,0.4)',
        'premium': '0 24px 80px rgba(0,0,0,0.08)',
        'inner-gold': 'inset 0 1px 0 0 rgba(212,168,74,0.2)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(15,30,61,0.95) 0%, rgba(27,61,133,0.85) 50%, rgba(15,30,61,0.75) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #fbbf24 0%, #d4a84a 50%, #b8902f 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0f1e3d 0%, #162f65 50%, #1b3d85 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(-4px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(40px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
