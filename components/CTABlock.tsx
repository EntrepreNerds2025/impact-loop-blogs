import Link from 'next/link';
import { BRAND } from '@/config/brand';

export default function CTABlock({
  heading,
  body,
  variant = 'primary',
}: {
  heading?: string;
  body?: string;
  variant?: 'primary' | 'secondary';
}) {
  const cta = variant === 'secondary' ? BRAND.cta.secondary : BRAND.cta.primary;
  return (
    <div className="my-10 p-8 rounded-2xl bg-brand-surface border border-brand-border text-center">
      <h3 className="text-2xl font-display font-semibold mb-3">
        {heading ?? `Ready to work with ${BRAND.name}?`}
      </h3>
      {body && <p className="text-brand-text-muted mb-5 max-w-xl mx-auto">{body}</p>}
      <Link
        href={cta.href}
        className="inline-block px-6 py-3 rounded-full bg-brand-primary text-brand-primary-foreground font-medium hover:opacity-90 transition-opacity"
      >
        {cta.text}
      </Link>
    </div>
  );
}
