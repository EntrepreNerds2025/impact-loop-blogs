import type { Metadata } from 'next';
import { getActiveBrandKey, BRAND } from '@/config/brand';
import { organizationJsonLd } from '@/lib/seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(`https://${BRAND.domain}`),
  title: {
    default: `${BRAND.name} Blog`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: `${BRAND.name} Blog`,
    locale: BRAND.locale,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = getActiveBrandKey();
  const orgJson = organizationJsonLd(brand);
  return (
    <html lang="en" data-brand={brand}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={BRAND.fonts.googleFontsHref} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJson) }}
        />
      </head>
      <body>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
