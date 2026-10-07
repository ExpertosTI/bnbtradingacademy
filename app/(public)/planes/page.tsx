import Link from "next/link";
import { money } from "@/lib/format";
import { getSettings, listExams } from "@/lib/db";

export const metadata = { title: "Planes" };

export default function PlanesPage() {
  const settings = getSettings();
  const exams = listExams().filter((exam) => exam.price_cents > 0);
  const entry = money(settings.entry_price_cents, settings.currency);
  const monthly = money(settings.monthly_price_cents, settings.currency);

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-5">
      <p className="eyebrow">Planes</p>
      <h1 className="mt-3 font-serif text-5xl">Qué se paga y cuándo sigue el cobro.</h1>
      <div className="mt-8 space-y-4">
        <article className="card">
          <h2 className="font-serif text-3xl">Inscripción {entry}</h2>
          <p className="mt-2 text-mute">Se cobra una vez, junto con el primer mes, el día en que confirmas el acceso.</p>
        </article>
        <article className="card">
          <h2 className="font-serif text-3xl">Membresía {monthly}</h2>
          <p className="mt-2 text-mute">
            El primer periodo empieza el día del pago. La siguiente mensualidad queda fechada 30 días después, con el precio que tenía el plan en ese momento.
          </p>
        </article>
        {exams.map((exam) => (
          <article key={exam.id} className="card">
            <h2 className="font-serif text-2xl">{exam.title}</h2>
            <p className="mt-2 text-mute">Pago aparte de {money(exam.price_cents, settings.currency)}, definido en administración.</p>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm text-mute">Si la mensualidad vence, se suspenden los contenidos premium. El historial de facturas queda en la cuenta.</p>
      <Link className="btn-gold mt-8" href="/registro">Continuar al registro</Link>
    </div>
  );
}
