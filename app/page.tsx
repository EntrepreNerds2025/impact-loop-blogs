import Link from 'next/link';
import Image from 'next/image';
import { getAllPostsFromSanity } from '@/lib/sanityPosts';
import { BRAND } from '@/config/brand';
import PostCard from '@/components/PostCard';

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPostsFromSanity();
  const [hero, ...rest] = posts;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-semibold mb-4">
          {BRAND.name}{' '}
          <span className="text-brand-primary">Blog</span>
        </h1>
        <p className="text-lg text-brand-text-muted max-w-2xl mx-auto">
          {BRAND.tagline}
        </p>
      </section>

      {hero && (
        <Link
          href={`/blog/${hero.frontmatter.slug}`}
          className="block group mb-16 rounded-2xl overflow-hidden border border-brand-border bg-brand-surface"
        >
          <div className="grid md:grid-cols-2 gap-0">
            {hero.frontmatter.featuredImage && (
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px]">
                <Image
                  src={hero.frontmatter.featuredImage}
                  alt={hero.frontmatter.featuredImageAlt ?? hero.frontmatter.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            )}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-widest text-brand-primary mb-3">
                Featured | {hero.frontmatter.category}
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4 group-hover:text-brand-primary transition-colors">
                {hero.frontmatter.title}
              </h2>
              {hero.frontmatter.excerpt && (
                <p className="text-brand-text-muted">{hero.frontmatter.excerpt}</p>
              )}
              <p className="mt-4 text-sm text-brand-text-muted">{hero.readingTime}</p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((post) => (
          <PostCard key={post.frontmatter.slug} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-brand-text-muted py-20">
          No posts published yet. Check back soon.
        </p>
      )}
    </div>
  );
}

