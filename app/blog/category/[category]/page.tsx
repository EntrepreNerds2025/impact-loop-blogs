import { notFound } from 'next/navigation';
import { getCategories, getPostsByCategory } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import { BRAND } from '@/config/brand';

export const revalidate = 60;

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: encodeURIComponent(c.toLowerCase()) }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const cat = decodeURIComponent(params.category);
  return {
    title: `${cat} | ${BRAND.name} Blog`,
    description: `${cat} posts on the ${BRAND.name} blog.`,
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = decodeURIComponent(params.category);
  const posts = getPostsByCategory(cat);
  if (posts.length === 0) notFound();
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-brand-primary mb-2">Category</p>
      <h1 className="text-4xl md:text-5xl font-display font-semibold mb-10 capitalize">{cat}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <PostCard key={p.frontmatter.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
