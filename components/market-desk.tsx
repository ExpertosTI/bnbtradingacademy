export function MarketDesk({
  entry,
  monthly,
  live,
  review,
}: {
  entry: string;
  monthly: string;
  live: string;
  review: string;
}) {
  const facts = [
    ["Inscripción de hoy", entry],
    ["Cada 30 días", monthly],
    ["Mesa, lunes a viernes", live],
    ["Repaso del domingo", review],
  ];
  return (
    <div className="rounded-2xl border border-gold/25 bg-panel p-6">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">Mesa privada</p>
      <ul className="mt-4 divide-y divide-white/10">
        {facts.map(([label, value]) => (
          <li key={label} className="flex items-baseline justify-between gap-4 py-4">
            <span className="text-sm text-mute">{label}</span>
            <span className="text-right font-serif text-2xl text-cream">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
