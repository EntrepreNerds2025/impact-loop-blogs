import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAllPostsFromSanity, getAuthorBySlugFromSanity, getPostsByAuthorFromSanity } from '@/lib/sanityPosts';
import PostCard from '@/components/PostCard';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPostsFromSanity();
  const slugs = Array.from(new Set(posts.map((post) => post.frontmatter.author)));
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const author = await getAuthorBySlugFromSanity(params.slug);
  if (!author) return {};
  return { title: author.name, description: author.bio ?? '' };
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const author = await getAuthorBySlugFromSanity(params.slug);
  if (!author) notFound();

  const posts = await getPostsByAuthorFromSanity(params.slug);
  if (posts.length === 0) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="flex flex-col sm:flex-row gap-6 items-start mb-12">
        {author.image && (
          <Image src={author.image} alt={author.name} width={120} height={120} className="rounded-full" />
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold mb-2">{author.name}</h1>
          <p className="text-brand-text-muted mb-3">{author.title}</p>
          {author.bio && <p className="max-w-2xl">{author.bio}</p>}
        </div>
      </header>
      <h2 className="text-xl font-display font-semibold mb-6">Posts by {author.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <PostCard key={p.frontmatter.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
