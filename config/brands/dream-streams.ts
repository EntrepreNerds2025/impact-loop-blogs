import type { BrandConfig } from '../brand.types';

/**
 * Dream Streams blog brand config.
 * Mirrors dreamstreams.ca: navy + copper + cream, Playfair Display + Rubik.
 *
 * Per Rovonn's direction, the BLOG specifically leans earthy/Etsy:
 * cream-dominant backgrounds, copper as the primary accent,
 * navy reserved for headings and link hover. Warmer, more lifestyle-feeling
 * than the main booking site.
 */
export const dreamStreamsBrand: BrandConfig = {
  key: 'dream-streams',
  name: 'Dream Streams',
  tagline: 'Wedding and funeral livestreaming, made meaningful',
  description:
    'Guides, stories, and planning resources for couples and families using livestreaming to bring loved ones together across distance.',
  domain: 'blog.dreamstreams.ca',
  mainSiteUrl: 'https://dreamstreams.ca',
  locale: 'en-CA',
  fonts: {
    sans: 'Rubik',
    serif: 'Playfair Display',
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Rubik:wght@300;400;500;600&display=swap',
  },
  nav: [
    { label: 'Dream Streams', href: 'https://dreamstreams.ca' },
    { label: 'Weddings', href: 'https://dreamstreams.ca/weddings' },
    { label: 'Funerals', href: 'https://dreamstreams.ca/funerals' },
    { label: 'Pricing', href: 'https://dreamstreams.ca/pricing' },
    { label: 'Book Your Stream', href: 'https://dreamstreams.ca/contact' },
  ],
  cta: {
    primary: {
      text: 'Check Date Availability',
      href: 'https://dreamstreams.ca/contact',
    },
    secondary: {
      text: 'View Pricing',
      href: 'https://dreamstreams.ca/pricing',
    },
  },
  social: {
    instagram: 'https://www.instagram.com/dreamstreamsca',
    linkedin: '',
  },
  footer: {
    copyright: '© Dream Streams. Serving Ontario.',
    legalLinks: [
      { label: 'Privacy', href: 'https://dreamstreams.ca/privacy' },
    ],
  },
  ga4Id: 'G-5XGS8CK7RL',
  gscVerification: 'L1CWWPZ9iPa6MlpzmOhXgqk9_OyM8PS1cGTk_CkVtPk',
  defaultAuthor: 'rovonn-russell',
  organization: {
    name: 'Dream Streams',
    url: 'https://dreamstreams.ca',
    logo: '/brands/dream-streams/logo.svg',
  },
};
