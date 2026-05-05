import type { BrandConfig } from '../brand.types';

/**
 * Rovonn Russell personal brand blog config.
 * Mirrors rovonnrussell.com: warm cream backgrounds, charcoal primary,
 * warm orange + gold accents, Playfair Display + DM Sans.
 * Editorial magazine aesthetic, authority-driven.
 *
 * Positioning (post-May-2026 reposition): Storytelling + Systems brand for
 * founders, creators, and impact-driven leaders. Personal brand teaches
 * frameworks (including ADAPT); Impact Loop delivers org engagements.
 */
export const rovonnRussellBrand: BrandConfig = {
  key: 'rovonn-russell',
  name: 'Rovonn Russell',
  tagline: 'Storytelling + Systems',
  description:
    'Essays, frameworks, and field notes on storytelling, content systems, and practical AI for founders, creators, and impact-driven leaders.',
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
    { label: 'Start Here', href: 'https://rovonnrussell.com/start-here' },
    { label: 'Resources', href: 'https://rovonnrussell.com/resources' },
    { label: 'Speaking', href: 'https://rovonnrussell.com/speaking' },
    { label: 'Work With Me', href: 'https://rovonnrussell.com/work-with-me' },
  ],
  cta: {
    primary: {
      text: 'Get the Visibility Starter Kit',
      href: 'https://rovonnrussell.com/resources/visibility-starter-kit',
    },
    secondary: {
      text: 'Work With Rovonn',
      href: 'https://rovonnrussell.com/work-with-me',
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
  ga4Id: 'G-VG1NB2L60C',
  gscVerification: 'CRMvCS00gRo39gzCwTwjxL_ClpKs02woZz3hjQMiKTw',
  defaultAuthor: 'rovonn-russell',
  organization: {
    name: 'Rovonn Russell',
    url: 'https://rovonnrussell.com',
    logo: '/brands/rovonn-russell/logo.svg',
  },
};
