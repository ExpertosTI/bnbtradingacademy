import Link from "next/link";
import { OfferPanel } from "@/components/offer-panel";
import { money } from "@/lib/format";
import { currentOffer } from "@/lib/offer";
import { getSettings, listExams } from "@/lib/db";

export const metadata = { title: "Planes" };

export default function PlanesPage() {
  const settings = getSettings();
  const offer = currentOffer();
  const exams = listExams().filter((exam) => exam.price_cents > 0);
  const entry = money(offer.priceCents, settings.currency);
  const monthly = money(settings.monthly_price_cents, settings.currency);

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-5">
      <p className="eyebrow">Membresía</p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[0.95] md:text-7xl">Aparta el cupo en {entry}. Después vale {money(offer.listCents, settings.currency)}.</h1>
      <div className="mt-10 max-w-xl">
        <OfferPanel />
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <article className="card">
          <p className="eyebrow">Una vez, si apartas ahora</p>
          <h2 className="mt-4 font-mono text-6xl text-cream">{entry}</h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-mute line-through">Valor {money(offer.listCents, settings.currency)}</p>
          <p className="mt-5 leading-relaxed text-mute">Se cobra junto con el primer mes. Si el reloj cierra o se acaban los {offer.seats} lugares, la inscripción pasa al valor completo.</p>
        </article>
        <article className="frame card border-gold/40">
          <p className="eyebrow">Cada 30 días</p>
          <h2 className="mt-4 font-serif text-6xl">{monthly}</h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-gold">Primer mes incluido al entrar</p>
          <p className="mt-5 leading-relaxed text-mute">El periodo empieza el día del pago. La siguiente mensualidad queda fechada 30 días después, con el precio de tu plan.</p>
        </article>
      </div>
      {exams.length > 0 && (
        <div className="mt-6 space-y-3">
          {exams.map((exam) => (
            <article key={exam.id} className="card">
              <h2 className="font-serif text-2xl">{exam.title}</h2>
              <p className="mt-2 text-mute">Pago aparte de {money(exam.price_cents, settings.currency)}, definido en administración.</p>
            </article>
          ))}
        </div>
      )}
      <ul className="mt-8 grid gap-3 text-sm text-mute md:grid-cols-3">
        <li className="glass p-4">Si vence la mensualidad, se suspende el premium.</li>
        <li className="glass p-4">Las facturas quedan en tu cuenta.</li>
        <li className="glass p-4">Un cambio de precio público no reescribe planes ya activos.</li>
      </ul>
      <Link className="btn-gold mt-10" href="/registro">Apartar mi cupo</Link>
    </div>
  );
}
