import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { buildPostMetadata } from '@/lib/seo';
import {
  getAllSlugsFromSanity,
  getAllPostsFromSanity,
  getCategoriesFromSanity,
  getPostBySlugFromSanity,
  getRelatedPostsFromSanity,
} from '@/lib/sanityPosts';
import PostLayout from '@/components/PostLayout';
import SanityPortableText from '@/components/SanityPortableText';
import { mdxComponents } from '@/mdx-components';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSlugsFromSanity();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlugFromSanity(params.slug);
  if (!post) return {};
  return buildPostMetadata(post);
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlugFromSanity(params.slug);
  if (!post) notFound();

  const [relatedPosts, recentPosts, categories] = await Promise.all([
    getRelatedPostsFromSanity(post, 3, post.brand),
    getAllPostsFromSanity(post.brand),
    getCategoriesFromSanity(post.brand),
  ]);

  return (
    <PostLayout
      post={post}
      relatedPosts={relatedPosts}
      recentPosts={recentPosts}
      categories={categories}
    >
      {post.body && post.body.length > 0 ? (
        <SanityPortableText value={post.body} />
      ) : (
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
            },
          }}
        />
      )}
    </PostLayout>
  );
}
