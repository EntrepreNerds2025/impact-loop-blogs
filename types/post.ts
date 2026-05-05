/**
 * Frontmatter schema shared across all four brand blogs.
 * Adopted from the Camesha Russell mom-blog reference repo,
 * upgraded with GEO (Generative Engine Optimization) fields.
 */
export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string; // ISO 8601
  lastModified?: string; // ISO 8601
  author: string; // author key, e.g. "rovonn-russell"
  authorName?: string;
  category: string;
  tags?: string[];
  excerpt: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  seoTitle?: string;
  metaDescription: string;
  published: boolean;
  pillarPage?: boolean;
  pillarSlug?: string;
  /** Optional FAQ block, rendered as FAQPage JSON-LD */
  faq?: { question: string; answer: string }[];
}

export interface PostAuthorProfile {
  name: string;
  slug: string;
  title?: string;
  bio?: string;
  image?: string;
  links?: { label: string; href: string }[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: 'link';
  href: string;
  openInNewTab?: boolean;
}

export interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style?: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote';
  children: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
  listItem?: 'bullet' | 'number';
  level?: number;
}

export interface PortableTextImageBlock {
  _type: 'image';
  _key: string;
  url?: string;
  alt?: string;
  caption?: string;
}

export interface PortableTextCtaBlock {
  _type: 'ctaBlock';
  _key: string;
  heading?: string;
  text?: string;
  buttonLabel?: string;
  buttonHref?: string;
  variant?: 'primary' | 'secondary' | 'subtle';
  utmCampaign?: string;
}

export interface PortableTextCodeBlock {
  _type: 'codeBlock';
  _key: string;
  code?: string;
  language?: string;
  filename?: string;
}

export interface PortableTextEmbedBlock {
  _type: 'embedBlock';
  _key: string;
  url?: string;
  caption?: string;
}

export type PortableTextNode =
  | PortableTextBlock
  | PortableTextImageBlock
  | PortableTextCtaBlock
  | PortableTextCodeBlock
  | PortableTextEmbedBlock;

export interface SidebarImageCtaModule {
  _type: 'sidebarImageCta';
  _key: string;
  imageUrl?: string;
  imageAlt?: string;
  heading?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export interface SidebarPromoModule {
  _type: 'sidebarPromo';
  _key: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
  theme?: 'dark' | 'light';
}

export interface SidebarTrendingItem {
  _key: string;
  title: string;
  href: string;
}

export interface SidebarTrendingModule {
  _type: 'sidebarTrending';
  _key: string;
  title?: string;
  items?: SidebarTrendingItem[];
}

export interface SidebarNewsletterModule {
  _type: 'sidebarNewsletter';
  _key: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
}

export interface SidebarCategoriesModule {
  _type: 'sidebarCategories';
  _key: string;
  title?: string;
}

export interface SidebarRecentPostsModule {
  _type: 'sidebarRecentPosts';
  _key: string;
  title?: string;
  limit?: number;
}

export interface SidebarTocModule {
  _type: 'sidebarToc';
  _key: string;
  title?: string;
}

export type SidebarModule =
  | SidebarImageCtaModule
  | SidebarPromoModule
  | SidebarTrendingModule
  | SidebarNewsletterModule
  | SidebarCategoriesModule
  | SidebarRecentPostsModule
  | SidebarTocModule;

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: string;
  brand: BrandKey;
  body?: PortableTextNode[];
  authorProfile?: PostAuthorProfile;
  sidebarModules?: SidebarModule[];
  sidebarTitle?: string;
}

export type BrandKey =
  | 'impact-loop'
  | 'rovonn-russell'
  | 'dream-streams'
  | 'il-foundation';
