import { Feed } from 'feed';
import { getAllPosts } from '@/lib/posts';
import { BRAND } from '@/config/brand';

export const revalidate = 3600;

export async function GET() {
  const base = `https://${BRAND.domain}`;
  const feed = new Feed({
    title: `${BRAND.name} Blog`,
    description: BRAND.description,
    id: base,
    link: base,
    language: BRAND.locale,
    copyright: BRAND.footer.copyright,
    updated: new Date(),
    generator: 'Next.js',
    feedLinks: { rss2: `${base}/feed.xml` },
    author: { name: BRAND.defaultAuthor },
  });

  for (const p of getAllPosts()) {
    const fm = p.frontmatter;
    feed.addItem({
      title: fm.title,
      id: `${base}/blog/${fm.slug}`,
      link: `${base}/blog/${fm.slug}`,
      description: fm.excerpt,
      date: new Date(fm.date),
      image: fm.featuredImage ? `${base}${fm.featuredImage}` : undefined,
    });
  }

  return new Response(feed.rss2(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
