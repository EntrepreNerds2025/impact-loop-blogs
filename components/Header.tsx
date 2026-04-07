import Link from 'next/link';
import { BRAND } from '@/config/brand';

export default function Header() {
  return (
    <header className="border-b border-brand-border bg-brand-bg">
      <div className="container mx-auto flex items-center justify-between py-5">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-brand-text">
          {BRAND.name}
          <span className="ml-2 text-sm font-sans font-normal text-brand-text-muted">
            / Blog
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {BRAND.nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-brand-text-muted transition-colors hover:text-brand-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href={BRAND.cta.primary.href}
          className="hidden md:inline-flex items-center rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary-foreground transition-opacity hover:opacity-90"
        >
          {BRAND.cta.primary.text}
        </a>
      </div>
    </header>
  );
}
