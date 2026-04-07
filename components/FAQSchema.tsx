import { faqJsonLd } from '@/lib/seo';

export interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSchema({ items }: { items: FAQItem[] }) {
  if (!items?.length) return null;
  const json = faqJsonLd(items);
  return (
    <>
      <section className="my-12">
        <h2 className="text-2xl font-display font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {items.map((it, i) => (
            <details
              key={i}
              className="p-5 rounded-lg border border-brand-border bg-brand-surface group"
            >
              <summary className="cursor-pointer font-medium text-brand-text">
                {it.question}
              </summary>
              <p className="mt-3 text-brand-text-muted">{it.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      />
    </>
  );
}
