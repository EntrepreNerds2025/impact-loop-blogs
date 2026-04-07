import Link from 'next/link';
import { getAllPosts, getCategories } from '@/lib/posts';
import CTABlock from './CTABlock';

export default function Sidebar() {
  const recent = getAllPosts().slice(0, 5);
  const categories = getCategories();
  return (
    <aside className="space-y-8">
      <CTABlock />
      <div>
        <h4 className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
          Recent Posts
        </h4>
        <ul className="space-y-3">
          {recent.map((p) => (
            <li key={p.frontmatter.slug}>
              <Link
                href={`/blog/${p.frontmatter.slug}`}
                className="text-sm hover:text-brand-primary"
              >
                {p.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
          Categories
        </h4>
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c}>
              <Link
                href={`/blog/category/${encodeURIComponent(c.toLowerCase())}`}
                className="text-xs px-3 py-1 rounded-full border border-brand-border hover:border-brand-primary hover:text-brand-primary"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
