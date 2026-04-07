import { getAllPosts } from '@/lib/posts';
import { BRAND } from '@/config/brand';

export const revalidate = 3600;

export async function GET() {
  const base = `https://${BRAND.domain}`;
  const posts = getAllPosts();
  const lines: string[] = [];
  lines.push(`# ${BRAND.name}`);
  lines.push('');
  lines.push(`> ${BRAND.description}`);
  lines.push('');
  lines.push(`Site: ${base}`);
  lines.push(`Main site: ${BRAND.mainSiteUrl}`);
  lines.push(`Author: ${BRAND.defaultAuthor}`);
  lines.push('');
  lines.push('## Posts');
  for (const p of posts) {
    lines.push(`- [${p.frontmatter.title}](${base}/blog/${p.frontmatter.slug}) — ${p.frontmatter.excerpt ?? ''}`);
  }
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
