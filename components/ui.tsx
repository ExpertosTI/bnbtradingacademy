import Link from "next/link";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="btn-gold" type="submit">
      {children}
    </button>
  );
}

export function Locked({ title, reasons }: { title: string; reasons: string[] }) {
  return (
    <section className="card max-w-2xl">
      <p className="eyebrow">Acceso cerrado</p>
      <h1 className="mt-3 font-serif text-4xl text-cream">{title}</h1>
      <ul className="mt-6 space-y-2 text-mute">
        {reasons.map((reason) => (
          <li key={reason}>— {reason}</li>
        ))}
      </ul>
      <div className="mt-6 flex gap-3">
        <Link className="btn-gold" href="/cursos">
          Ver mi ruta
        </Link>
        <Link className="btn-ghost" href="/pagos">
          Membresía
        </Link>
      </div>
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">{label}</p>
      <p className="mt-2 font-serif text-3xl text-cream">{value}</p>
    </div>
  );
}
