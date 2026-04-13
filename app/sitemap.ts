import type { MetadataRoute } from 'next';
import { getAllPostsFromSanity, getCategoriesFromSanity } from '@/lib/sanityPosts';
import { BRAND } from '@/config/brand';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${BRAND.domain}`;
  const [posts, cats] = await Promise.all([
    getAllPostsFromSanity(),
    getCategoriesFromSanity(),
  ]);
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    ...cats.map((c) => ({
      url: `${base}/blog/category/${encodeURIComponent(c.toLowerCase())}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.frontmatter.slug}`,
      lastModified: new Date(p.frontmatter.lastModified ?? p.frontmatter.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
