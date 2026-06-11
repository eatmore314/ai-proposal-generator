import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9973a',
          light: '#e4b96a',
          dark: '#a07428',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.06', letterSpacing: '-0.035em', fontWeight: '700' }],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(17,17,24,0.06), 0 4px 12px rgba(17,17,24,0.04)',
        'card-hover': '0 2px 8px rgba(17,17,24,0.08), 0 8px 24px rgba(17,17,24,0.06)',
        'button': '0 1px 2px rgba(17,17,24,0.15)',
        'button-hover': '0 2px 6px rgba(17,17,24,0.20)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
