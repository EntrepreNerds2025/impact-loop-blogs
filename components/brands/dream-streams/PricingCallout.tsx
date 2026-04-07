import Link from 'next/link';
import { BRAND } from '@/config/brand';

export default function PricingCallout({
  tier,
  price,
  includes,
}: {
  tier: string;
  price: string;
  includes: string[];
}) {
  return (
    <div className="my-10 p-7 rounded-2xl border-2 border-brand-primary/30 bg-brand-surface">
      <p className="text-xs uppercase tracking-widest text-brand-primary mb-2">{tier}</p>
      <p className="text-4xl font-display font-semibold mb-4">{price}</p>
      <ul className="space-y-1.5 text-sm mb-5">
        {includes.map((it) => (
          <li key={it}>· {it}</li>
        ))}
      </ul>
      <Link
        href={BRAND.cta.primary.href}
        className="inline-block px-5 py-2.5 rounded-full bg-brand-primary text-brand-primary-foreground text-sm font-medium"
      >
        {BRAND.cta.primary.text}
      </Link>
    </div>
  );
}
