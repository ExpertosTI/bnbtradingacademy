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
    <div className="rounded-2xl border border-[#e4dfd4] bg-white p-6 shadow-[0_16px_40px_rgba(28,25,23,0.05)]">
      <p className="text-sm font-semibold text-good">Así entra alguien hoy</p>
      <ul className="mt-5 divide-y divide-[#e4dfd4]">
        {facts.map(([label, value]) => (
          <li key={label} className="flex items-baseline justify-between gap-4 py-4">
            <span className="text-sm text-mute">{label}</span>
            <span className="text-right text-lg font-semibold tracking-tight">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
