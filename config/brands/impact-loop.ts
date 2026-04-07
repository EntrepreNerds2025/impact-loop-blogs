import type { BrandConfig } from '../brand.types';

/**
 * Impact Loop blog brand config.
 * Mirrors impactloop.ca: vivid blue + purple, Plus Jakarta Sans + Cormorant Garamond,
 * editorial premium aesthetic with cinematic white space.
 */
export const impactLoopBrand: BrandConfig = {
  key: 'impact-loop',
  name: 'Impact Loop',
  tagline: 'Storytelling and systems for organizations communicating their impact',
  description:
    'The Impact Loop blog: nonprofit storytelling, impact communication, ESG narrative, and the systems that make impact visible.',
  domain: 'blog.impactloop.ca',
  mainSiteUrl: 'https://impactloop.ca',
  locale: 'en-CA',
  fonts: {
    sans: 'Plus Jakarta Sans',
    serif: 'Cormorant Garamond',
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
  },
  nav: [
    { label: 'Impact Loop', href: 'https://impactloop.ca' },
    { label: 'Diagnostic', href: 'https://impactloop.ca/diagnostic' },
    { label: 'Work', href: 'https://impactloop.ca/work' },
    { label: 'Services', href: 'https://impactloop.ca/services' },
    { label: 'Book a Call', href: 'https://impactloop.ca/booking' },
  ],
  cta: {
    primary: {
      text: 'Take the Impact Story Diagnostic',
      href: 'https://impactloop.ca/diagnostic',
    },
    secondary: {
      text: 'See Our Work',
      href: 'https://impactloop.ca/work',
    },
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/rovonnrussell',
    youtube: '',
  },
  footer: {
    copyright: '© Impact Loop. Toronto, Ontario.',
    legalLinks: [
      { label: 'Privacy', href: 'https://impactloop.ca/privacy' },
      { label: 'Terms', href: 'https://impactloop.ca/terms' },
    ],
  },
  ga4Id: 'G-85JD3CZ1FD',
  gscVerification: 'DPWQuZmcSgQZiz2SuO2wLKO67sSzgytfOKiRYsqex9M',
  defaultAuthor: 'rovonn-russell',
  organization: {
    name: 'Impact Loop',
    url: 'https://impactloop.ca',
    logo: '/brands/impact-loop/logo.svg',
  },
};
