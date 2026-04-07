import { BRAND } from '@/config/brand';

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const url = `https://${BRAND.domain}/blog/${slug}`;
  const enc = encodeURIComponent;
  const links = [
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: 'Twitter', href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: 'Email', href: `mailto:?subject=${enc(title)}&body=${enc(url)}` },
  ];
  return (
    <div className="flex flex-wrap gap-2 my-6">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm rounded-full border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-colors"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
