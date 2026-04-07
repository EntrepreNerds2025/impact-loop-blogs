import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/types/post';
import { getRelatedPosts } from '@/lib/posts';
import { articleJsonLd } from '@/lib/seo';
import Breadcrumbs from './Breadcrumbs';
import ReadingProgressBar from './ReadingProgressBar';
import ShareButtons from './ShareButtons';
import AuthorBio from './AuthorBio';
import CTABlock from './CTABlock';
import FAQSchema from './FAQSchema';
import PostCard from './PostCard';

export default function PostLayout({
  post,
  children,
}: {
  post: Post;
  children: React.ReactNode;
}) {
  const fm = post.frontmatter;
  const related = getRelatedPosts(post);
  const json = articleJsonLd(post);

  return (
    <article>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      />

      <header className="max-w-3xl mx-auto px-4 pt-10">
        <Breadcrumbs
          items={[
            { label: 'Blog', href: '/' },
            { label: fm.category, href: `/blog/category/${encodeURIComponent(fm.category.toLowerCase())}` },
            { label: fm.title },
          ]}
        />
        <p className="text-xs uppercase tracking-widest text-brand-primary mb-3">
          {fm.category}
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-semibold leading-tight mb-5">
          {fm.title}
        </h1>
        {fm.excerpt && (
          <p className="text-lg text-brand-text-muted mb-6">{fm.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-sm text-brand-text-muted">
          <Link href={`/blog/author/${fm.author}`} className="hover:text-brand-primary">
            {fm.author}
          </Link>
          <span aria-hidden>·</span>
          <time dateTime={fm.date}>
            {new Date(fm.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </div>
      </header>

      {fm.featuredImage && (
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <Image
            src={fm.featuredImage}
            alt={fm.featuredImageAlt ?? fm.title}
            width={1600}
            height={900}
            className="rounded-2xl w-full h-auto"
            priority
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 mt-10">
        <div className="prose-brand">{children}</div>
        <ShareButtons slug={fm.slug} title={fm.title} />
        {fm.faq && fm.faq.length > 0 && <FAQSchema items={fm.faq} />}
        <AuthorBio authorSlug={fm.author} />
        <CTABlock />
      </div>

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-16">
          <h2 className="text-2xl font-display font-semibold mb-6">Related Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => (
              <PostCard key={p.frontmatter.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
