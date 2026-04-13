import type { BrandKey, Post, PortableTextNode, SidebarModule } from '@/types/post';
import { getActiveBrandKey } from '@/config/brand';
import { sanityClient } from '@/sanity/client';
import {
  getAllPosts as getAllPostsFromMdx,
  getAllSlugs as getAllSlugsFromMdx,
  getCategories as getCategoriesFromMdx,
  getPostBySlug as getPostBySlugFromMdx,
  getPostsByCategory as getPostsByCategoryFromMdx,
  getRelatedPosts as getRelatedPostsFromMdx,
} from '@/lib/posts';
import { getAuthor } from '@/lib/authors';
import {
  allPostsQuery,
  postBySlugQuery,
  allSlugsQuery,
  categoriesQuery,
  postsByCategoryQuery,
  relatedPostsQuery,
  postsByAuthorQuery,
  authorBySlugQuery,
} from '@/sanity/queries';
import { portableTextToPlainText } from '@/lib/portableText';

interface SanityAuthor {
  name?: string;
  slug?: string;
  title?: string;
  bio?: string;
  image?: string;
  links?: { label?: string; href?: string }[];
}

interface SanityPost {
  _id: string;
  title: string;
  slug: string;
  date: string;
  lastModified?: string;
  author?: SanityAuthor;
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
  faq?: { question: string; answer: string }[];
  readingTime?: string;
  body?: PortableTextNode[];
  brand: BrandKey;
  sidebarModules?: SidebarModule[];
  sidebarTitle?: string;
}

function estimateReadingTimeFromBody(body: PortableTextNode[] | undefined): string {
  if (!body || body.length === 0) return '5 min read';

  const plainText = portableTextToPlainText(body);
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min read`;
}

function mapSanityPost(post: SanityPost): Post {
  const authorSlug = post.author?.slug ?? 'rovonn-russell';
  const readingTime = post.readingTime || estimateReadingTimeFromBody(post.body);

  return {
    frontmatter: {
      title: post.title,
      slug: post.slug,
      date: post.date,
      lastModified: post.lastModified,
      author: authorSlug,
      authorName: post.author?.name,
      category: post.category,
      tags: post.tags ?? [],
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      featuredImageAlt: post.featuredImageAlt,
      seoTitle: post.seoTitle,
      metaDescription: post.metaDescription,
      published: post.published,
      pillarPage: post.pillarPage,
      pillarSlug: post.pillarSlug,
      faq: post.faq ?? [],
    },
    content: '',
    readingTime,
    brand: post.brand,
    body: post.body ?? [],
    sidebarModules: post.sidebarModules ?? [],
    sidebarTitle: post.sidebarTitle,
    authorProfile: post.author
      ? {
          name: post.author.name ?? 'Rovonn Russell',
          slug: post.author.slug ?? authorSlug,
          title: post.author.title,
          bio: post.author.bio,
          image: post.author.image,
          links: (post.author.links ?? [])
            .filter((item) => item.label && item.href)
            .map((item) => ({ label: item.label!, href: item.href! })),
        }
      : undefined,
  };
}

export async function getAllPostsFromSanity(brand: BrandKey = getActiveBrandKey()): Promise<Post[]> {
  try {
    const results = await sanityClient.fetch<SanityPost[]>(allPostsQuery, { brand });
    return (results ?? []).map(mapSanityPost);
  } catch (error) {
    console.error('Sanity fetch failed (all posts), falling back to local MDX:', error);
    return getAllPostsFromMdx(brand);
  }
}

export async function getPostBySlugFromSanity(
  slug: string,
  brand: BrandKey = getActiveBrandKey()
): Promise<Post | null> {
  try {
    const result = await sanityClient.fetch<SanityPost | null>(postBySlugQuery, { slug, brand });
    return result ? mapSanityPost(result) : null;
  } catch (error) {
    console.error(`Sanity fetch failed (post ${slug}), falling back to local MDX:`, error);
    return getPostBySlugFromMdx(slug, brand);
  }
}

export async function getAllSlugsFromSanity(brand: BrandKey = getActiveBrandKey()): Promise<string[]> {
  try {
    const slugs = await sanityClient.fetch<{ slug: string }[]>(allSlugsQuery, { brand });
    return (slugs ?? []).map((row) => row.slug).filter(Boolean);
  } catch (error) {
    console.error('Sanity fetch failed (slugs), falling back to local MDX:', error);
    return getAllSlugsFromMdx(brand);
  }
}

export async function getCategoriesFromSanity(brand: BrandKey = getActiveBrandKey()): Promise<string[]> {
  try {
    const categories = await sanityClient.fetch<string[]>(categoriesQuery, { brand });
    return (categories ?? []).filter(Boolean).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Sanity fetch failed (categories), falling back to local MDX:', error);
    return getCategoriesFromMdx(brand);
  }
}

export async function getPostsByCategoryFromSanity(
  category: string,
  brand: BrandKey = getActiveBrandKey()
): Promise<Post[]> {
  try {
    const posts = await sanityClient.fetch<SanityPost[]>(postsByCategoryQuery, { brand, category });
    return (posts ?? []).map(mapSanityPost);
  } catch (error) {
    console.error(`Sanity fetch failed (category ${category}), falling back to local MDX:`, error);
    return getPostsByCategoryFromMdx(category, brand);
  }
}

export async function getRelatedPostsFromSanity(
  post: Post,
  limit = 3,
  brand: BrandKey = getActiveBrandKey()
): Promise<Post[]> {
  try {
    const posts = await sanityClient.fetch<SanityPost[]>(relatedPostsQuery, {
      brand,
      currentSlug: post.frontmatter.slug,
      category: post.frontmatter.category,
      tags: post.frontmatter.tags ?? [],
      limit,
    });
    return (posts ?? []).map(mapSanityPost);
  } catch (error) {
    console.error('Sanity fetch failed (related posts), falling back to local MDX:', error);
    return getRelatedPostsFromMdx(post, brand, limit);
  }
}

export async function getPostsByAuthorFromSanity(
  authorSlug: string,
  brand: BrandKey = getActiveBrandKey()
): Promise<Post[]> {
  try {
    const posts = await sanityClient.fetch<SanityPost[]>(postsByAuthorQuery, {
      brand,
      authorSlug,
    });
    return (posts ?? []).map(mapSanityPost);
  } catch (error) {
    console.error(`Sanity fetch failed (author ${authorSlug}), falling back to local MDX:`, error);
    return getAllPostsFromMdx(brand).filter((post) => post.frontmatter.author === authorSlug);
  }
}

export async function getAuthorBySlugFromSanity(slug: string): Promise<Post['authorProfile'] | null> {
  try {
    const author = await sanityClient.fetch<SanityAuthor | null>(authorBySlugQuery, { slug });
    if (!author) return null;

    return {
      name: author.name ?? 'Rovonn Russell',
      slug: author.slug ?? slug,
      title: author.title,
      bio: author.bio,
      image: author.image,
      links: (author.links ?? [])
        .filter((item) => item.label && item.href)
        .map((item) => ({ label: item.label!, href: item.href! })),
    };
  } catch (error) {
    console.error(`Sanity fetch failed (author profile ${slug}), falling back to local author:`, error);
    const author = getAuthor(slug);
    return {
      name: author.name,
      slug: author.slug,
      title: author.title,
      bio: author.bio,
      image: author.image,
      links: author.links,
    };
  }
}
