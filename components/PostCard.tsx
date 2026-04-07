import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/types/post';

export default function PostCard({ post }: { post: Post }) {
  const fm = post.frontmatter;
  return (
    <article className="group rounded-xl overflow-hidden border border-brand-border bg-brand-surface hover:shadow-lg transition-shadow">
      <Link href={`/blog/${fm.slug}`}>
        {fm.featuredImage && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={fm.featuredImage}
              alt={fm.featuredImageAlt ?? fm.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-2 uppercase tracking-wide">
            <span>{fm.category}</span>
            <span aria-hidden>·</span>
            <span>{post.readingTime}</span>
          </div>
          <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-brand-primary transition-colors">
            {fm.title}
          </h3>
          {fm.excerpt && (
            <p className="text-sm text-brand-text-muted line-clamp-3">{fm.excerpt}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
