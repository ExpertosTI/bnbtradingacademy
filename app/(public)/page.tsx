import Link from "next/link";
import { MarketDesk } from "@/components/market-desk";
import { OfferPanel } from "@/components/offer-panel";
import { Reveal } from "@/components/reveal";
import { Ticker } from "@/components/ticker";
import { money } from "@/lib/format";
import { currentOffer } from "@/lib/offer";
import { getSettings, listLevels, listTeachers } from "@/lib/db";

export default function HomePage() {
  const settings = getSettings();
  const offer = currentOffer();
  const levels = listLevels();
  const teachers = listTeachers();
  const entry = money(offer.priceCents, settings.currency);
  const monthly = money(settings.monthly_price_cents, settings.currency);
  const flow = [
    ["01", "Cuenta", "Datos, experiencia declarada y términos. Declararte avanzado no abre la mesa."],
    ["02", "Aparta", "Ves el valor del cupo, la oferta que sigue abierta y los lugares que quedan antes de pagar."],
    ["03", "Estudio", "Lecciones protegidas. El progreso queda en tu perfil, no en un enlace suelto."],
    ["04", "Examen", "Banco administrable, nota, intentos y desbloqueo automático del siguiente nivel."],
    ["05", "Mesa", "Lunes a viernes dentro del campus. El domingo, el repaso y el ranking."],
  ];
  const paths = [
    ["01", "Principiante", "Empiezas en Nivel 1. Sin los videos, el examen no se abre."],
    ["02", "Intermedio", "Puedes validar el Nivel 1. Si no apruebas, las lecciones pasan a ser obligatorias."],
    ["03", "Avanzado", "La práctica exige la validación de la academia. Elegir avanzado no la salta."],
  ];

  return (
    <div className="relative z-10">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-8 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-10">
        <Reveal>
          <p className="eyebrow">Campus privado · {settings.timezone.replace(/_/g, " ")}</p>
          <h1 className="mt-5 max-w-xl text-5xl font-medium leading-[0.95] tracking-[-0.05em] text-cream sm:text-7xl">
            La mesa está en el campus.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-mute">
            El cupo vale {money(offer.listCents, settings.currency)}. Quien aparta ahora lo asegura en {money(offer.priceCents, settings.currency)}, mientras queden lugares y el reloj siga abierto.
          </p>
          <div className="mt-8">
            <OfferPanel />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-gold" href="/registro">Apartar mi cupo</Link>
            <Link className="btn-ghost" href="/planes">Ver cómo se paga</Link>
          </div>
          <p className="mt-6 max-w-sm text-xs leading-relaxed text-mute">Formación. No hay garantía de ganancia, fondeo ni resultado.</p>
        </Reveal>
        <Reveal delay={0.12}>
          <MarketDesk
            entry={entry}
            monthly={monthly}
            live={`${settings.live_start}–${settings.live_end}`}
            review={settings.review_start}
          />
        </Reveal>
      </section>

      <Ticker />

      <section id="programa" className="mx-auto max-w-6xl px-5 pt-20">
        <Reveal>
          <p className="eyebrow">El flujo</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-medium tracking-[-0.04em] md:text-5xl">Cinco pasos. Nadie manda el enlace a mano.</h2>
        </Reveal>
        <div className="relative mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
          <div className="pointer-events-none absolute left-0 right-0 top-[3px] hidden h-px bg-white/15 md:block" />
          {flow.map(([n, title, copy], index) => (
            <Reveal key={n} delay={index * 0.05}>
              <article>
                <span className="relative z-10 flex h-2 w-2 rounded-full bg-good shadow-[0_0_0_6px_#050506]" />
                <p className="mt-5 font-mono text-xs text-good">{n}</p>
                <h3 className="mt-2 text-2xl font-medium tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">{copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="niveles" className="mx-auto mt-28 max-w-6xl px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Ruta académica</p>
              <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] md:text-5xl">Tres niveles. Luego la mesa.</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-mute">Cada etapa se abre al aprobar la anterior. El examen no circula por chat.</p>
          </div>
        </Reveal>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {levels.map((level, index) => (
            <Reveal key={level.id}>
              <article className="grid gap-3 py-7 md:grid-cols-[120px_1fr_180px] md:items-center">
                <p className="font-mono text-sm text-good">{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <h3 className="text-3xl font-medium tracking-tight">{level.name}</h3>
                  <p className="mt-2 max-w-xl text-mute">{level.summary}</p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-mute">{level.practical ? "Live + domingo" : "Lecciones + examen"}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 md:grid-cols-3">
        {paths.map(([n, title, copy]) => (
          <article key={title} className="bg-[#070709] px-6 py-8 md:px-8">
            <p className="font-mono text-xs text-good">{n}</p>
            <h3 className="mt-4 text-3xl font-medium tracking-tight">{title}</h3>
            <p className="mt-3 leading-relaxed text-mute">{copy}</p>
          </article>
        ))}
        </div>
      </section>

      <section id="mesa" className="mx-auto mt-24 grid max-w-6xl gap-4 px-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <article className="card relative min-h-[280px]">
            <p className="eyebrow">Lunes a viernes</p>
            <h2 className="mt-4 max-w-md text-4xl font-medium tracking-[-0.04em] md:text-6xl">Trading en vivo, dentro del campus.</h2>
            <p className="mt-6 max-w-md leading-relaxed text-mute">
              Cuenta regresiva, botón de entrada y acceso controlado en servidor. Si te falta nivel o membresía, ves exactamente qué te falta.
            </p>
          </article>
        </Reveal>
        <Reveal delay={0.08}>
          <article className="card flex min-h-[320px] flex-col justify-between">
            <div>
              <p className="eyebrow">Domingo</p>
              <h2 className="mt-4 text-4xl font-medium tracking-tight">Repaso de la semana.</h2>
            </div>
            <p className="mt-6 leading-relaxed text-mute">
              Operaciones, preguntas, aprobados y el top académico. Un premio, si lo hay, lo confirma una persona. No sale solo ni representa una ganancia.
            </p>
          </article>
        </Reveal>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <p className="eyebrow">Mesa de profesores</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {teachers.map((teacher) => (
            <article key={teacher.id} className="card">
              <p className="font-mono text-xs text-good">{teacher.name.replace("Profesor de ", "").slice(0, 1).toUpperCase()}</p>
              <h3 className="mt-4 text-2xl font-medium tracking-tight">{teacher.name}</h3>
              <p className="mt-3 leading-relaxed text-mute">{teacher.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="card flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Oferta de cupo</p>
            <h2 className="mt-3 font-mono text-4xl tracking-tight md:text-5xl">
              <span className="mr-3 text-2xl text-mute line-through">{money(offer.listCents, settings.currency)}</span>
              {entry}
            </h2>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-good">para quien aparta ahora · luego {monthly} / 30 días</p>
            <p className="mt-5 max-w-xl leading-relaxed text-mute">
              Al cerrar el reloj o agotarse los {offer.seats} lugares, la inscripción pasa a {money(offer.listCents, settings.currency)}. Quien ya pagó conserva el monto de su plan.
            </p>
          </div>
          <Link className="btn-gold shrink-0" href="/registro">Apartar mi cupo</Link>
        </div>
      </section>
    </div>
  );
}
