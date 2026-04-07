import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAllPosts } from '@/lib/posts';
import { AUTHORS, getAuthor } from '@/lib/authors';
import PostCard from '@/components/PostCard';

export const revalidate = 60;

export function generateStaticParams() {
  return Object.keys(AUTHORS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const a = getAuthor(params.slug);
  return { title: a.name, description: a.bio };
}

export default function AuthorPage({ params }: { params: { slug: string } }) {
  const a = AUTHORS[params.slug];
  if (!a) notFound();
  const posts = getAllPosts().filter((p) => p.frontmatter.author === params.slug);
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="flex flex-col sm:flex-row gap-6 items-start mb-12">
        {a.image && (
          <Image src={a.image} alt={a.name} width={120} height={120} className="rounded-full" />
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold mb-2">{a.name}</h1>
          <p className="text-brand-text-muted mb-3">{a.title}</p>
          <p className="max-w-2xl">{a.bio}</p>
        </div>
      </header>
      <h2 className="text-xl font-display font-semibold mb-6">Posts by {a.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <PostCard key={p.frontmatter.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
