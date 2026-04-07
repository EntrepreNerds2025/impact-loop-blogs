import { BRAND } from '@/config/brand';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-border bg-brand-surface">
      <div className="container mx-auto py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-2xl font-semibold text-brand-text">{BRAND.name}</h3>
            <p className="mt-3 max-w-sm text-sm text-brand-text-muted">{BRAND.tagline}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-text">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {BRAND.nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-brand-text-muted hover:text-brand-primary">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-text">
              {BRAND.cta.primary.text.split(' ').slice(0, 2).join(' ')}
            </h4>
            <a
              href={BRAND.cta.primary.href}
              className="mt-3 inline-flex items-center rounded-full bg-brand-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-primary-foreground hover:opacity-90"
            >
              {BRAND.cta.primary.text}
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-brand-border pt-6 text-xs text-brand-text-muted md:flex-row md:items-center">
          <p>{BRAND.footer.copyright}</p>
          <ul className="flex gap-5">
            {BRAND.footer.legalLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-brand-primary">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
