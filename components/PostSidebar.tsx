import Link from 'next/link';
import type { PortableHeading } from '@/lib/portableText';
import type { Post, SidebarModule } from '@/types/post';
import { BRAND } from '@/config/brand';

interface PostSidebarProps {
  modules?: SidebarModule[];
  recentPosts: Post[];
  categories: string[];
  headings: PortableHeading[];
  currentSlug: string;
  sidebarTitle?: string;
}

function Divider() {
  return <div className="h-px bg-brand-border" />;
}

function SidebarCard({ children }: { children: React.ReactNode }) {
  return <section className="space-y-3">{children}</section>;
}

function renderModule(
  module: SidebarModule,
  recentPosts: Post[],
  categories: string[],
  headings: PortableHeading[],
  currentSlug: string
) {
  if (module._type === 'sidebarImageCta') {
    return (
      <SidebarCard>
        {module.imageUrl && (
          <a href={module.buttonHref || BRAND.cta.primary.href} className="block overflow-hidden rounded-lg border border-brand-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={module.imageUrl} alt={module.imageAlt || module.heading || 'Sidebar image'} className="w-full object-cover" />
          </a>
        )}
        {module.heading && (
          <h3 className="font-display text-xl font-semibold">{module.heading}</h3>
        )}
        {module.body && <p className="text-sm text-brand-text-muted">{module.body}</p>}
        {module.buttonLabel && module.buttonHref && (
          <a
            href={module.buttonHref}
            className="inline-block rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary-foreground"
          >
            {module.buttonLabel}
          </a>
        )}
      </SidebarCard>
    );
  }

  if (module._type === 'sidebarPromo') {
    const isDark = module.theme === 'dark';
    return (
      <SidebarCard>
        <div
          className={`rounded-xl border px-4 py-5 ${
            isDark
              ? 'border-brand-text bg-brand-text text-brand-primary-foreground'
              : 'border-brand-border bg-brand-surface text-brand-text'
          }`}
        >
          {module.eyebrow && (
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-brand-primary">
              {module.eyebrow}
            </p>
          )}
          <h3 className="font-display text-lg leading-tight">{module.heading}</h3>
          {module.body && (
            <p className={`mt-2 text-sm ${isDark ? 'text-brand-primary-foreground/75' : 'text-brand-text-muted'}`}>
              {module.body}
            </p>
          )}
          {module.buttonLabel && module.buttonHref && (
            <a
              href={module.buttonHref}
              className="mt-4 inline-block rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary-foreground"
            >
              {module.buttonLabel}
            </a>
          )}
        </div>
      </SidebarCard>
    );
  }

  if (module._type === 'sidebarTrending') {
    const items = module.items ?? [];
    if (items.length === 0) return null;
    return (
      <SidebarCard>
        <h3 className="font-display text-xl font-semibold">
          {module.title || 'Trending Topics'}
        </h3>
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item._key} className="border-b border-brand-border pb-2 last:border-b-0 last:pb-0">
              <a href={item.href} className="flex gap-2 text-sm hover:text-brand-primary">
                <span className="min-w-6 font-mono text-xs text-brand-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </SidebarCard>
    );
  }

  if (module._type === 'sidebarNewsletter') {
    return (
      <SidebarCard>
        <h3 className="text-center font-display text-xl font-semibold">
          {module.title || 'Stay in the Loop'}
        </h3>
        {module.body && <p className="text-center text-sm text-brand-text-muted">{module.body}</p>}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
          <input
            type="text"
            placeholder="First Name"
            className="w-full rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-brand-primary px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary-foreground"
          >
            {module.buttonLabel || 'Send It to Me'}
          </button>
        </form>
      </SidebarCard>
    );
  }

  if (module._type === 'sidebarCategories') {
    return (
      <SidebarCard>
        <h3 className="text-center font-display text-xl font-semibold">
          {module.title || 'Browse by Category'}
        </h3>
        <ul className="flex flex-col items-center gap-2">
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={`/blog/category/${encodeURIComponent(category.toLowerCase())}`}
                className="text-xs font-semibold uppercase tracking-wider text-brand-text hover:text-brand-primary"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarCard>
    );
  }

  if (module._type === 'sidebarRecentPosts') {
    const limit = module.limit ?? 5;
    const items = recentPosts
      .filter((post) => post.frontmatter.slug !== currentSlug)
      .slice(0, limit);
    if (items.length === 0) return null;
    return (
      <SidebarCard>
        <h3 className="font-display text-xl font-semibold">
          {module.title || 'Recent Posts'}
        </h3>
        <ul className="space-y-2">
          {items.map((post) => (
            <li key={post.frontmatter.slug}>
              <Link href={`/blog/${post.frontmatter.slug}`} className="text-sm hover:text-brand-primary">
                {post.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarCard>
    );
  }

  if (module._type === 'sidebarToc') {
    if (headings.length === 0) return null;
    return (
      <SidebarCard>
        <h3 className="font-display text-xl font-semibold">{module.title || 'On This Page'}</h3>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id} className={heading.level === 'h3' ? 'pl-3' : heading.level === 'h4' ? 'pl-6' : ''}>
              <a href={`#${heading.id}`} className="text-sm text-brand-text-muted hover:text-brand-primary">
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </SidebarCard>
    );
  }

  return null;
}

export default function PostSidebar({
  modules,
  recentPosts,
  categories,
  headings,
  currentSlug,
  sidebarTitle,
}: PostSidebarProps) {
  const fallbackModules: SidebarModule[] = [
    {
      _type: 'sidebarPromo',
      _key: 'default-promo',
      eyebrow: 'Start Here',
      heading: `New to ${BRAND.name}?`,
      body: BRAND.tagline,
      buttonLabel: BRAND.cta.primary.text,
      buttonHref: BRAND.cta.primary.href,
      theme: 'light',
    },
    {
      _type: 'sidebarToc',
      _key: 'default-toc',
      title: 'On This Page',
    },
    {
      _type: 'sidebarRecentPosts',
      _key: 'default-recent',
      title: 'Recent Posts',
      limit: 5,
    },
    {
      _type: 'sidebarCategories',
      _key: 'default-categories',
      title: 'Browse by Category',
    },
  ];

  const activeModules = modules && modules.length > 0 ? modules : fallbackModules;

  return (
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
      <div className="space-y-5 rounded-2xl border border-brand-border bg-brand-muted/40 p-5">
        {sidebarTitle && (
          <>
            <h2 className="font-display text-lg font-semibold">{sidebarTitle}</h2>
            <Divider />
          </>
        )}
        {activeModules.map((module, index) => (
          <div key={module._key}>
            {index > 0 && <Divider />}
            <div className={index > 0 ? 'pt-5' : ''}>
              {renderModule(module, recentPosts, categories, headings, currentSlug)}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
