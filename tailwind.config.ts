import type { Config } from 'tailwindcss';

/**
 * Brand-aware Tailwind config.
 * All brand-specific colors and fonts are driven by CSS custom properties
 * defined in app/globals.css under [data-brand="..."] selectors.
 *
 * This means ONE Tailwind config powers all four brands. The brand at build
 * time sets the data-brand attribute on <html>, and CSS variables resolve
 * accordingly. Tailwind classes like `bg-brand-primary` always work.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './content/**/*.{md,mdx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      fontFamily: {
        // Each brand sets these via CSS variables
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        display: ['var(--font-display, var(--font-serif))', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          bg: 'hsl(var(--brand-bg))',
          surface: 'hsl(var(--brand-surface))',
          text: 'hsl(var(--brand-text))',
          'text-muted': 'hsl(var(--brand-text-muted))',
          primary: 'hsl(var(--brand-primary))',
          'primary-foreground': 'hsl(var(--brand-primary-foreground))',
          accent: 'hsl(var(--brand-accent))',
          'accent-foreground': 'hsl(var(--brand-accent-foreground))',
          border: 'hsl(var(--brand-border))',
          muted: 'hsl(var(--brand-muted))',
        },
      },
      typography: () => ({
        DEFAULT: {
          css: {
            color: 'hsl(var(--brand-text))',
            maxWidth: 'none',
            a: {
              color: 'hsl(var(--brand-primary))',
              textDecoration: 'underline',
              textDecorationThickness: '1px',
              textUnderlineOffset: '3px',
            },
            'h1, h2, h3, h4': {
              fontFamily: 'var(--font-display, var(--font-serif))',
              color: 'hsl(var(--brand-text))',
              fontWeight: '600',
            },
          },
        },
      }),
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
