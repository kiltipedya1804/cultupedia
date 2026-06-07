import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette Cultupedia — inspirée du drapeau haïtien + or colonial + noir profond
        brand: {
          rouge:   '#C1001F',
          'rouge-dark': '#8B0015',
          'rouge-light': '#E8374F',
          bleu:    '#00235B',
          'bleu-mid':  '#003F8A',
          'bleu-light': '#1A5CAD',
          or:      '#D4A017',
          'or-light':  '#F0C040',
          'or-dark':   '#A07810',
          noir:    '#0A0A0F',
          'noir-soft': '#111118',
          creme:   '#FAF6EE',
          'creme-dark': '#F0E8D8',
        },
        discipline: {
          musique:     '#C1001F',
          danse:       '#7C3AED',
          cinema:      '#0369A1',
          graffiti:    '#D97706',
          theatre:     '#059669',
          gastronomie: '#DC2626',
          edition:     '#4F46E5',
        }
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-fira-code)', 'monospace'],
        creole:  ['var(--font-playfair)', 'serif'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'hero-pattern': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(193,0,31,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,35,91,0.12), transparent)',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-right':'slideRight 0.5s ease-out forwards',
        'shimmer':    'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer:  { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      boxShadow: {
        'card':  '0 2px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
        'glow-rouge': '0 0 30px rgba(193,0,31,0.25)',
        'glow-or':    '0 0 30px rgba(212,160,23,0.25)',
        'inner-soft': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
    },
  },
  plugins: [],
}

export default config
