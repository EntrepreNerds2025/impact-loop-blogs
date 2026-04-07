import Image from 'next/image';
import Link from 'next/link';
import { getAuthor } from '@/lib/authors';

export default function AuthorBio({ authorSlug }: { authorSlug: string }) {
  const a = getAuthor(authorSlug);
  if (!a) return null;
  return (
    <aside className="mt-12 p-6 rounded-xl border border-brand-border bg-brand-surface flex flex-col sm:flex-row gap-5 items-start">
      {a.image && (
        <Image
          src={a.image}
          alt={a.name}
          width={80}
          height={80}
          className="rounded-full flex-shrink-0"
        />
      )}
      <div>
        <h3 className="text-lg font-semibold mb-1">{a.name}</h3>
        <p className="text-sm text-brand-text-muted mb-2">{a.title}</p>
        {a.bio && <p className="text-sm mb-3">{a.bio}</p>}
        {a.links?.length > 0 && (
          <div className="flex flex-wrap gap-3 text-sm">
            {a.links.map((l) => (
              <Link key={l.label} href={l.href} className="text-brand-primary hover:underline">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
