/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '4rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-eb-garamond)', 'Georgia', 'serif'],
      },
      colors: {
        // Colonial color palette - primary project colors
        colonial: {
          navy: '#102542', // Deep navy blue - primary brand color
          burgundy: '#711322', // Rich burgundy - accent color
          parchment: '#f3e9d2', // Aged parchment - background color
          gold: '#c3a343', // Muted gold - highlight color
          stone: '#d8d3c8', // Stone/neutral - secondary background
        },
        // System UI colors - mapped to colonial palette
        border: 'hsl(var(--colonial-stone))',
        input: 'hsl(var(--colonial-stone))',
        ring: 'hsl(var(--colonial-gold))',
        background: 'hsl(var(--colonial-parchment))',
        foreground: 'hsl(var(--colonial-navy))',
        primary: {
          DEFAULT: 'hsl(var(--colonial-navy))',
          foreground: 'hsl(var(--colonial-parchment))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--colonial-burgundy))',
          foreground: 'hsl(var(--colonial-parchment))',
        },
        destructive: {
          DEFAULT: '#d32f2f', // This one isn't in your colonial palette
          foreground: 'hsl(var(--colonial-parchment))',
        },
        muted: {
          DEFAULT: 'hsl(var(--colonial-stone))',
          foreground: 'hsl(var(--colonial-navy))',
        },
        accent: {
          DEFAULT: 'hsl(var(--colonial-gold))',
          foreground: 'hsl(var(--colonial-navy))',
        },
        popover: {
          DEFAULT: 'hsl(var(--colonial-parchment))',
          foreground: 'hsl(var(--colonial-navy))',
        },
        card: {
          DEFAULT: '#ffffff', // White - not in your colonial palette
          foreground: 'hsl(var(--colonial-navy))',
        },
      },
      borderRadius: {
        lg: '0.5rem', // 8px
        md: '0.375rem', // 6px
        sm: '0.25rem', // 4px
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'ken-burns': {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'ken-burns': 'ken-burns 10s ease-in-out infinite alternate',
      },
      transitionDuration: {
        2000: '2000ms',
        3000: '3000ms',
        5000: '5000ms',
        10000: '10000ms',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.colonial.navy'),
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.colonial.navy'),
              fontFamily: theme('fontFamily.sans'),
              fontWeight: '700',
            },
            'p, li': {
              fontFamily: theme('fontFamily.serif'),
            },
            a: {
              color: theme('colors.colonial.burgundy'),
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.colonial.burgundy'),
                opacity: '0.8',
              },
            },
          },
        },
      }),
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
