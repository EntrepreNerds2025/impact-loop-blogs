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

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: string;
  brand: BrandKey;
}

export type BrandKey =
  | 'impact-loop'
  | 'rovonn-russell'
  | 'dream-streams'
  | 'il-foundation';
