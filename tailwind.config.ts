import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        primaryAccent: 'rgb(var(--color-primary-accent) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        background: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
          secondary: 'rgb(var(--color-background-secondary) / <alpha-value>)'
        },
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        border: 'rgba(var(--color-border-default))',
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          secondary: 'rgb(var(--color-accent-secondary) / <alpha-value>)'
        },
        badge: {
          DEFAULT: 'rgb(var(--color-badge-bg) / <alpha-value>)',
          text: 'rgb(var(--color-badge-text) / <alpha-value>)'
        },
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        destructive: 'rgb(var(--color-destructive) / <alpha-value>)',
        positive: 'rgb(var(--color-positive) / <alpha-value>)'
      },
      fontFamily: {
        primary: 'var(--font-primary)',
        geist: 'var(--font-geist-sans)',
        lora: 'var(--font-lora)',
        dmmono: 'var(--font-dm-mono)'
      },
      borderRadius: {
        xl: '10px'
      }
    }
  },
  plugins: [tailwindcssAnimate]
} satisfies Config
