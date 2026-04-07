import type { BrandConfig } from '../brand.types';

/**
 * IL Foundation blog brand config (STUB).
 * Per the Phased Build-Out Plan, this brand launches in Phase 4 when the
 * pilot cohort begins. Palette and typography will be finalized then.
 * Stub kept here so the monorepo build/type system stays consistent.
 */
export const ilFoundationBrand: BrandConfig = {
  key: 'il-foundation',
  name: 'IL Foundation',
  tagline: 'Youth storytelling that changes communities',
  description:
    'The IL Foundation runs youth media cohorts that turn lived experience into community-changing stories.',
  domain: 'blog.ilfoundation.ca',
  mainSiteUrl: 'https://impactloop.ca/foundation',
  locale: 'en-CA',
  fonts: {
    sans: 'Plus Jakarta Sans',
    serif: 'Cormorant Garamond',
    googleFontsHref:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
  },
  nav: [
    { label: 'IL Foundation', href: 'https://impactloop.ca/foundation' },
    { label: 'Cohorts', href: 'https://impactloop.ca/foundation/cohorts' },
    { label: 'Sponsor', href: 'https://impactloop.ca/foundation/sponsor' },
  ],
  cta: {
    primary: {
      text: 'Sponsor a Cohort',
      href: 'https://impactloop.ca/foundation/sponsor',
    },
    secondary: {
      text: 'Refer a Young Person',
      href: 'https://impactloop.ca/foundation/refer',
    },
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/rovonnrussell',
  },
  footer: {
    copyright: '© IL Foundation, a program of Impact Loop. Toronto, Ontario.',
    legalLinks: [
      { label: 'Privacy', href: 'https://impactloop.ca/privacy' },
    ],
  },
  defaultAuthor: 'rovonn-russell',
  organization: {
    name: 'IL Foundation',
    url: 'https://impactloop.ca/foundation',
    logo: '/brands/il-foundation/logo.svg',
  },
};
