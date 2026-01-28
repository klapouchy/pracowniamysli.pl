/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Therapy practice color palette
        steel: {
          50: '#f4f6f7',
          100: '#e8ecef',
          200: '#d4dde2',
          300: '#b4c3cb',
          400: '#8da3b0',
          500: '#5c7e8f',
          600: '#4d6a7a',
          700: '#405766',
          800: '#384a55',
          900: '#323f49',
          950: '#212a31',
        },
        gray: {
          50: '#f7f7f7',
          100: '#ededed',
          200: '#dfdfdf',
          300: '#c8c8c8',
          400: '#a2a2a2',
          500: '#8a8a8a',
          600: '#717171',
          700: '#5e5e5e',
          800: '#4f4f4f',
          900: '#454545',
          950: '#262626',
        },
        magenta: {
          50: '#fef1f6',
          100: '#fee5ef',
          200: '#fecce1',
          300: '#fea3c8',
          400: '#fb6aa3',
          500: '#f2055c',
          600: '#e2174f',
          700: '#c40d3d',
          800: '#a20f35',
          900: '#871130',
          950: '#520317',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // shadcn/ui required colors
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
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Lora', 'Georgia', 'serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
