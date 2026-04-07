import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { BrandKey, Post, PostFrontmatter } from '@/types/post';
import { getActiveBrandKey } from '@/config/brand';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

function brandDir(brand: BrandKey) {
  return path.join(CONTENT_ROOT, brand);
}

export function getAllPosts(brand: BrandKey = getActiveBrandKey()): Post[] {
  const dir = brandDir(brand);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const posts: Post[] = files
    .map((file) => loadPostFile(brand, file))
    .filter((p): p is Post => !!p && p.frontmatter.published)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    );
  return posts;
}

export function getPostBySlug(slug: string, brand: BrandKey = getActiveBrandKey()): Post | null {
  const dir = brandDir(brand);
  if (!fs.existsSync(dir)) return null;
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const filename of candidates) {
    const full = path.join(dir, filename);
    if (fs.existsSync(full)) {
      return loadPostFile(brand, filename);
    }
  }
  return null;
}

export function getAllSlugs(brand: BrandKey = getActiveBrandKey()): string[] {
  return getAllPosts(brand).map((p) => p.frontmatter.slug);
}

export function getCategories(brand: BrandKey = getActiveBrandKey()): string[] {
  const set = new Set<string>();
  for (const p of getAllPosts(brand)) set.add(p.frontmatter.category);
  return Array.from(set).sort();
}

export function getPostsByCategory(category: string, brand: BrandKey = getActiveBrandKey()): Post[] {
  return getAllPosts(brand).filter(
    (p) => p.frontmatter.category.toLowerCase() === category.toLowerCase()
  );
}

export function getRelatedPosts(post: Post, brand: BrandKey = getActiveBrandKey(), limit = 3): Post[] {
  const all = getAllPosts(brand).filter((p) => p.frontmatter.slug !== post.frontmatter.slug);
  const score = (p: Post) => {
    let s = 0;
    if (p.frontmatter.category === post.frontmatter.category) s += 3;
    const tagsA = new Set(post.frontmatter.tags ?? []);
    for (const t of p.frontmatter.tags ?? []) if (tagsA.has(t)) s += 1;
    if (post.frontmatter.pillarSlug && p.frontmatter.pillarSlug === post.frontmatter.pillarSlug) s += 2;
    return s;
  };
  return all
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

function loadPostFile(brand: BrandKey, filename: string): Post | null {
  try {
    const full = path.join(brandDir(brand), filename);
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);
    const fm = data as PostFrontmatter;
    if (!fm.slug) fm.slug = filename.replace(/\.mdx?$/, '');
    return {
      frontmatter: fm,
      content,
      readingTime: readingTime(content).text,
      brand,
    };
  } catch (err) {
    console.error(`Failed to load post ${brand}/${filename}:`, err);
    return null;
  }
}
