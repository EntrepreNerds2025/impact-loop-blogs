export default function ImpactStat({
  value,
  label,
  source,
}: {
  value: string;
  label: string;
  source?: string;
}) {
  return (
    <div className="my-8 p-6 rounded-xl border-l-4 border-brand-primary bg-brand-surface">
      <p className="text-4xl md:text-5xl font-display font-bold text-brand-primary">{value}</p>
      <p className="mt-2 text-base">{label}</p>
      {source && <p className="mt-1 text-xs text-brand-text-muted italic">Source: {source}</p>}
    </div>
  );
}
