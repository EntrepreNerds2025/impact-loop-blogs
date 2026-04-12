import { groq } from 'next-sanity';

// ─── Post Queries ────────────────────────────────────────────────
// These mirror the functions in lib/posts.ts but fetch from Sanity

export const allPostsQuery = groq`
  *[_type == "post" && brand == $brand && published == true] | order(date desc) {
    _id,
    title,
    slug,
    date,
    lastModified,
    "author": author->{ name, slug, title, image, bio },
    category,
    tags,
    excerpt,
    featuredImage,
    featuredImageAlt,
    seoTitle,
    metaDescription,
    published,
    pillarPage,
    pillarSlug,
    readingTime,
    brand
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug && brand == $brand][0] {
    _id,
    title,
    slug,
    date,
    lastModified,
    "author": author->{ name, slug, title, image, bio, links },
    category,
    tags,
    excerpt,
    featuredImage,
    featuredImageAlt,
    seoTitle,
    metaDescription,
    published,
    pillarPage,
    pillarSlug,
    faq,
    readingTime,
    body,
    brand
  }
`;

export const allSlugsQuery = groq`
  *[_type == "post" && brand == $brand && published == true] {
    "slug": slug.current
  }
`;

export const categoriesQuery = groq`
  array::unique(*[_type == "post" && brand == $brand && published == true].category)
`;

export const postsByCategoryQuery = groq`
  *[_type == "post" && brand == $brand && category == $category && published == true] | order(date desc) {
    _id,
    title,
    slug,
    date,
    "author": author->{ name, slug, title, image },
    category,
    tags,
    excerpt,
    featuredImage,
    featuredImageAlt,
    readingTime,
    brand
  }
`;

export const relatedPostsQuery = groq`
  *[_type == "post" && brand == $brand && published == true && slug.current != $currentSlug && (
    category == $category || count((tags[])[@ in $tags]) > 0
  )] | order(date desc) [0...$limit] {
    _id,
    title,
    slug,
    date,
    "author": author->{ name, slug, title, image },
    category,
    tags,
    excerpt,
    featuredImage,
    featuredImageAlt,
    readingTime,
    brand
  }
`;

// ─── Author Queries ──────────────────────────────────────────────

export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    title,
    bio,
    image,
    links
  }
`;

export const allAuthorsQuery = groq`
  *[_type == "author"] | order(name asc) {
    _id,
    name,
    slug,
    title,
    bio,
    image
  }
`;
