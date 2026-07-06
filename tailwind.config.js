/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
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
          gold: '#e8b903', // Bright gold - highlight color
          stone: '#d8d3c8', // Stone/neutral - secondary background
          linenTexture: '#f5f1e6',
          linenWoven: '#f7f3ea',
          vintagePaper: '#f8f3e6',
          parchment: '#f4e9d5',
          frame: '#0b0d12', // Night Gallery near-black moulding
          // Deep oxblood room surface for the people-and-story wing
          // (news/about/team/sponsors/contact) — derived from burgundy,
          // which stays the ACCENT; this is the wall paint.
          oxblood: '#470d16',
        },
        // System UI colors - mapped to colonial palette
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
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
      boxShadow: {
        // Night Gallery museum shadows (values from the shop treatment)
        plate: '0 18px 44px -22px rgba(0,0,0,0.85)',
        'plate-lg': '0 28px 64px -24px rgba(0,0,0,0.9)',
        card: '0 22px 48px -18px rgba(11,15,32,0.5)',
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
              textDecoration: 'underline',
              textDecorationColor: theme('colors.colonial.burgundy'),
              textDecorationThickness: '1px',
              textUnderlineOffset: '2px',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.colonial.burgundy'),
                textDecorationColor: theme('colors.colonial.burgundy'),
                textDecorationThickness: '2px',
              },
            },
          },
        },
      }),
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
