export default function InsightBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-8 p-6 rounded-xl bg-brand-surface border border-brand-border">
      <p className="text-xs uppercase tracking-widest text-brand-accent mb-2">Insight</p>
      <h4 className="text-xl font-display font-semibold mb-3">{title}</h4>
      <div className="text-brand-text-muted">{children}</div>
    </div>
  );
}
