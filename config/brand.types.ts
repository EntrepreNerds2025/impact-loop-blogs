import type { BrandKey } from '@/types/post';

export interface NavLink {
  label: string;
  href: string;
}

export interface BrandConfig {
  key: BrandKey;
  name: string;
  tagline: string;
  description: string;
  domain: string; // e.g. blog.impactloop.ca
  mainSiteUrl: string; // e.g. https://impactloop.ca
  locale: string;
  fonts: {
    sans: string;
    serif: string;
    googleFontsHref: string;
  };
  nav: NavLink[];
  cta: {
    primary: { text: string; href: string };
    secondary: { text: string; href: string };
  };
  social: {
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  footer: {
    copyright: string;
    legalLinks: NavLink[];
  };
  defaultAuthor: string;
  organization: {
    name: string;
    url: string;
    logo: string;
  };
}
