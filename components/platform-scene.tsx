const rows = [
  ["EURUSD", "up"],
  ["GBPUSD", "down"],
  ["USDJPY", "up"],
  ["XAUUSD", "up"],
  ["US30", "down"],
  ["NAS100", "up"],
  ["BTCUSD", "down"],
  ["ETHUSD", "up"],
] as const;

const candles = [42, 68, 36, 74, 28, 80, 48, 62, 34, 88, 40, 70];

export function PlatformScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#07111f]" aria-hidden>
      <div className="absolute inset-0 scale-105 opacity-70 blur-[1.5px]">
        <div className="flex h-14 items-center gap-6 border-b border-white/10 bg-[#0b1730] px-6">
          {["Mercados", "Gráficos", "Órdenes", "Historial"].map((item) => (
            <span key={item} className="text-xs text-white/50">{item}</span>
          ))}
        </div>
        <div className="grid h-[calc(100%-3.5rem)] grid-cols-[280px_1fr]">
          <div className="border-r border-white/10 bg-[#0a1428]">
            {rows.map(([name, side]) => (
              <div key={name} className="flex items-center justify-between border-b border-white/5 px-4 py-4">
                <span className="text-sm text-white/80">{name}</span>
                <span className={`h-2 w-16 rounded-sm ${side === "up" ? "bg-emerald-500/80" : "bg-rose-500/80"}`} />
              </div>
            ))}
          </div>
          <div className="relative bg-[#0c1830]">
            <div className="absolute inset-x-8 bottom-16 top-10 flex items-end gap-3">
              {candles.map((height, index) => (
                <span
                  key={index}
                  className={`w-full rounded-sm ${index % 3 === 1 ? "bg-rose-500" : "bg-emerald-400"}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-[#07111f]/55" />
    </div>
  );
}
