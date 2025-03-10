/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1.5rem",
                sm: "2rem", 
                lg: "4rem"
            },
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
                serif: ["var(--font-eb-garamond)", "Georgia", "serif"],
            },
            colors: {
                // Colonial color palette - primary project colors
                colonial: {
                    navy: "#102542", // Deep navy blue - primary brand color
                    burgundy: "#711322", // Rich burgundy - accent color
                    parchment: "#f3e9d2", // Aged parchment - background color
                    gold: "#c3a343", // Muted gold - highlight color
                    stone: "#d8d3c8", // Stone/neutral - secondary background
                },
                // System UI colors - mapped to colonial palette
                border: "#d8d3c8", // Light stone color
                input: "#d8d3c8",
                ring: "#c3a343", // Gold for focus states
                background: "#f3e9d2", // Parchment
                foreground: "#102542", // Navy
                primary: {
                    DEFAULT: "#102542", // Navy
                    foreground: "#f3e9d2", // Parchment
                },
                secondary: {
                    DEFAULT: "#711322", // Burgundy
                    foreground: "#f3e9d2", // Parchment
                },
                destructive: {
                    DEFAULT: "#d32f2f", // Red
                    foreground: "#f3e9d2", // Parchment
                },
                muted: {
                    DEFAULT: "#d8d3c8", // Stone
                    foreground: "#102542", // Navy
                },
                accent: {
                    DEFAULT: "#c3a343", // Gold
                    foreground: "#102542", // Navy
                },
                popover: {
                    DEFAULT: "#f3e9d2", // Parchment
                    foreground: "#102542", // Navy
                },
                card: {
                    DEFAULT: "#ffffff", // White
                    foreground: "#102542", // Navy
                },
            },
            borderRadius: {
                lg: "0.5rem", // 8px
                md: "0.375rem", // 6px
                sm: "0.25rem", // 4px
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                "ken-burns": {
                    from: { transform: "scale(1)" },
                    to: { transform: "scale(1.05)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "ken-burns": "ken-burns 10s ease-in-out infinite alternate",
            },
            transitionDuration: {
                '2000': '2000ms',
                '3000': '3000ms',
                '5000': '5000ms',
                '10000': '10000ms',
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
    plugins: [
        require("tailwindcss-animate"),
        require("@tailwindcss/typography"),
    ],
}
