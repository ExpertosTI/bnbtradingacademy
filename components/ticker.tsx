const tape: [string, string, "up" | "down"][] = [
  ["N1", "Criterio", "up"],
  ["N1", "Riesgo", "up"],
  ["N1", "Plan", "up"],
  ["EX", "Examen", "down"],
  ["N2", "Estructura", "up"],
  ["N3", "Intensivo", "up"],
  ["LV", "Mesa 09:00", "up"],
  ["DO", "Repaso", "down"],
];

export function Ticker() {
  const row = [...tape, ...tape];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-black/40 py-2.5">
      <div className="ticker-track flex w-max items-center gap-8 px-4">
        {row.map(([code, label, side], index) => (
          <span key={`${code}-${index}`} className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="text-mute">{code}</span>
            <span className="text-cream">{label}</span>
            <span className={side === "up" ? "text-good" : "text-bad"}>{side === "up" ? "▲" : "▼"}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
