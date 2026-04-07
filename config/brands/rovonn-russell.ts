import type { BrandConfig } from '../brand.types';

/**
 * Rovonn Russell personal brand blog config.
 * Mirrors rovonnrussell.com: warm cream backgrounds, charcoal primary,
 * warm orange + gold accents, Playfair Display + DM Sans.
 * Editorial magazine aesthetic, authority-driven.
 */
export const rovonnRussellBrand: BrandConfig = {
  key: 'rovonn-russell',
  name: 'Rovonn Russell',
  tagline: 'Impact Story Architect',
  description:
    'Essays and frameworks on impact storytelling, narrative architecture, and building systems that make mission-driven work impossible to ignore.',
  domain: 'blog.rovonnrussell.com',
  mainSiteUrl: 'https://rovonnrussell.com',
  locale: 'en-CA',
  fonts: {
    sans: 'DM Sans',
    serif: 'Playfair Display',
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap',
  },
  nav: [
    { label: 'Rovonn Russell', href: 'https://rovonnrussell.com' },
    { label: 'Frameworks', href: 'https://rovonnrussell.com/frameworks' },
    { label: 'Speaking', href: 'https://rovonnrussell.com/speaking' },
    { label: 'Diagnostic', href: 'https://rovonnrussell.com/diagnostic' },
    { label: 'Work With Me', href: 'https://rovonnrussell.com/work-with-me' },
  ],
  cta: {
    primary: {
      text: 'Book a Strategy Session',
      href: 'https://rovonnrussell.com/work-with-me',
    },
    secondary: {
      text: 'Explore the 5-Pillar Framework',
      href: 'https://rovonnrussell.com/frameworks',
    },
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/rovonnrussell',
    youtube: '',
  },
  footer: {
    copyright: '© Rovonn Russell. Toronto, Ontario.',
    legalLinks: [
      { label: 'Privacy', href: 'https://rovonnrussell.com/privacy' },
    ],
  },
  defaultAuthor: 'rovonn-russell',
  organization: {
    name: 'Rovonn Russell',
    url: 'https://rovonnrussell.com',
    logo: '/brands/rovonn-russell/logo.svg',
  },
};
