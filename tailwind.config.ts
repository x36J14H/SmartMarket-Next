import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        obsidian: {
          DEFAULT: '#090A0F',
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          800: '#161922',
          900: '#0E1118',
          950: '#08090D',
        },
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.06)',
        'premium-hover': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.25)',
        'glow-emerald-lg': '0 0 60px -5px rgba(16, 185, 129, 0.35)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
