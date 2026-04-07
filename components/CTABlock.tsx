import Link from 'next/link';
import { BRAND } from '@/config/brand';

function appendUtm(href: string, source: string, medium: string, campaign: string) {
  try {
    const url = new URL(href);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', medium);
    url.searchParams.set('utm_campaign', campaign);
    return url.toString();
  } catch {
    // href is a relative path — return as-is
    return href;
  }
}

export default function CTABlock({
  heading,
  body,
  variant = 'primary',
  utmCampaign,
}: {
  heading?: string;
  body?: string;
  variant?: 'primary' | 'secondary';
  utmCampaign?: string;
}) {
  const cta = variant === 'secondary' ? BRAND.cta.secondary : BRAND.cta.primary;
  const href = appendUtm(
    cta.href,
    BRAND.key,           // utm_source  e.g. "impact-loop"
    'blog-cta',          // utm_medium
    utmCampaign ?? 'blog-post-cta', // utm_campaign
  );
  return (
    <div className="my-10 p-8 rounded-2xl bg-brand-surface border border-brand-border text-center">
      <h3 className="text-2xl font-display font-semibold mb-3">
        {heading ?? `Ready to work with ${BRAND.name}?`}
      </h3>
      {body && <p className="text-brand-text-muted mb-5 max-w-xl mx-auto">{body}</p>}
      <Link
        href={href}
        className="inline-block px-6 py-3 rounded-full bg-brand-primary text-brand-primary-foreground font-medium hover:opacity-90 transition-opacity"
      >
        {cta.text}
      </Link>
    </div>
  );
}
