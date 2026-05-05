import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/types/post';
import { articleJsonLd } from '@/lib/seo';
import { extractPortableTextHeadings } from '@/lib/portableText';
import Breadcrumbs from './Breadcrumbs';
import ReadingProgressBar from './ReadingProgressBar';
import ShareButtons from './ShareButtons';
import AuthorBio from './AuthorBio';
import CTABlock from './CTABlock';
import FAQSchema from './FAQSchema';
import PostCard from './PostCard';
import PostSidebar from './PostSidebar';

export default function PostLayout({
  post,
  children,
  relatedPosts,
  recentPosts,
  categories,
}: {
  post: Post;
  children: React.ReactNode;
  relatedPosts: Post[];
  recentPosts: Post[];
  categories: string[];
}) {
  const fm = post.frontmatter;
  const headings = extractPortableTextHeadings(post.body);
  const json = articleJsonLd(post);
  const authorLabel = fm.authorName ?? post.authorProfile?.name ?? fm.author;
  const authorSlug = post.authorProfile?.slug ?? fm.author;
  const formattedDate = new Date(fm.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      />

      <header className="border-b border-brand-border bg-brand-bg">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center md:py-14">
          <Breadcrumbs
            items={[
              { label: 'Blog', href: '/' },
              {
                label: fm.category,
                href: `/blog/category/${encodeURIComponent(fm.category.toLowerCase())}`,
              },
              { label: fm.title },
            ]}
          />
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-brand-primary">
            {fm.category}
          </p>
          <div className="mx-auto mt-2 h-0.5 w-10 bg-brand-primary" />
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-display font-semibold leading-tight md:text-5xl">
            {fm.title}
          </h1>
          {fm.excerpt && (
            <p className="mx-auto mt-5 max-w-2xl text-base text-brand-text-muted md:text-lg">
              {fm.excerpt}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-[0.15em] text-brand-text-muted">
            <Link href={`/blog/author/${authorSlug}`} className="hover:text-brand-primary">
              {authorLabel}
            </Link>
            <span aria-hidden>|</span>
            <time dateTime={fm.date}>{formattedDate}</time>
            <span aria-hidden>|</span>
            <span>{post.readingTime}</span>
          </div>
        </div>
      </header>

      <div className="bg-brand-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-[1.75rem] border border-brand-border bg-brand-bg shadow-[0_24px_80px_hsl(var(--brand-text)/0.08)]">
              {fm.featuredImage && (
                <div className="bg-brand-muted">
                  <Image
                    src={fm.featuredImage}
                    alt={fm.featuredImageAlt ?? fm.title}
                    width={1600}
                    height={900}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
              )}

              <div className="grid border-b border-brand-border bg-brand-surface text-center text-[11px] uppercase tracking-[0.16em] text-brand-text-muted sm:grid-cols-3">
                <div className="border-b border-brand-border px-4 py-3 sm:border-b-0 sm:border-r">
                  <span className="block font-semibold text-brand-text">Category</span>
                  <span>{fm.category}</span>
                </div>
                <div className="border-b border-brand-border px-4 py-3 sm:border-b-0 sm:border-r">
                  <span className="block font-semibold text-brand-text">Updated</span>
                  <time dateTime={fm.date}>{formattedDate}</time>
                </div>
                <div className="px-4 py-3">
                  <span className="block font-semibold text-brand-text">Read Time</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>

              <div className="space-y-8 p-5 md:p-8">
                <div className="prose-brand">{children}</div>
                <ShareButtons slug={fm.slug} title={fm.title} />
                {fm.faq && fm.faq.length > 0 && <FAQSchema items={fm.faq} />}
                <AuthorBio authorSlug={authorSlug} author={post.authorProfile} />
                <CTABlock variant="secondary" />
              </div>
            </div>

            <PostSidebar
              modules={post.sidebarModules}
              recentPosts={recentPosts}
              categories={categories}
              headings={headings}
              currentSlug={fm.slug}
              sidebarTitle={post.sidebarTitle}
            />
          </div>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-display font-semibold">Related Reading</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedPosts.map((item) => (
              <PostCard key={item.frontmatter.slug} post={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
