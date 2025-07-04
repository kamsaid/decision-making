import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Enable dark mode using class strategy for better control
  darkMode: "class",
  theme: {
    extend: {
      // Typography configuration using Inter font
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      // Enhanced typography scale using rem units
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.625' }],     // 12px - leading-relaxed default
        'sm': ['0.875rem', { lineHeight: '1.625' }],    // 14px - leading-relaxed default
        'base': ['1rem', { lineHeight: '1.625' }],      // 16px - leading-relaxed default
        'lg': ['1.125rem', { lineHeight: '1.625' }],    // 18px - leading-relaxed default
        'xl': ['1.25rem', { lineHeight: '1.625' }],     // 20px - leading-relaxed default
        '2xl': ['1.5rem', { lineHeight: '1.625' }],     // 24px - leading-relaxed default
        '3xl': ['1.875rem', { lineHeight: '1.625' }],   // 30px - leading-relaxed default
        '4xl': ['2.25rem', { lineHeight: '1.625' }],    // 36px - leading-relaxed default
        '5xl': ['3rem', { lineHeight: '1.625' }],       // 48px - leading-relaxed default
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Duson Color Palette - Semantic Design Tokens
        "bg-base": "var(--bg-base)",           // Light mode background (#FAF5E6)
        "bg-base-dark": "var(--bg-base-dark)", // Dark mode background (#2D2C2E)
        "accent-primary": "var(--accent-primary)", // Primary actions/links (#FD1F4A)
        "accent-secondary": "var(--accent-secondary)", // Secondary accents (#FBBD0D)
        // Legacy Liquid Glass Design Tokens (kept for backward compatibility)
        "background-primary": "var(--background-primary)",
        "background-secondary": "var(--background-secondary)",
        "surface-glass": "var(--surface-glass)",
        "surface-elevated": "var(--surface-elevated)",
        "primary-brand": "var(--primary-brand)",
        "primary-accent": "var(--primary-accent)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
      },
      // Enhanced backdrop blur utilities for glass effects (aligned with Tailwind v4.1)
      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      // Enhanced background opacity utilities for glass effects
      backgroundOpacity: {
        '5': '0.05',
        '15': '0.15',
        '35': '0.35',
        '45': '0.45',
        '55': '0.55',
        '65': '0.65',
        '85': '0.85',
        '95': '0.95',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
