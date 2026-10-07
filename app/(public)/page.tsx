import Link from "next/link";
import { money } from "@/lib/format";
import { getSettings, listLevels, listTeachers } from "@/lib/db";

export default function HomePage() {
  const settings = getSettings();
  const levels = listLevels();
  const teachers = listTeachers();
  const entry = money(settings.entry_price_cents, settings.currency);
  const monthly = money(settings.monthly_price_cents, settings.currency);
  const flow = [
    ["01", "Cuenta", "Datos, experiencia declarada y términos. Declararte avanzado no abre la mesa."],
    ["02", "Pago", "Ves inscripción, primer mes y la fecha del siguiente cobro antes de confirmar."],
    ["03", "Estudio", "Lecciones protegidas. El progreso queda en tu perfil, no en un enlace suelto."],
    ["04", "Examen", "Banco administrable, nota, intentos y desbloqueo automático del siguiente nivel."],
    ["05", "Mesa", "Lunes a viernes dentro del campus. El domingo, el repaso y el ranking."],
  ];

  return (
    <div className="relative z-10">
      <section className="mx-auto grid max-w-6xl items-end gap-12 px-5 pb-20 pt-10 md:grid-cols-[1.15fr_0.85fr]">
        <div className="rise">
          <p className="eyebrow">Campus privado · {settings.timezone.replace("_", " ")}</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.04] text-cream md:text-7xl">
            Una academia que te lleva de la lección a la <span className="italic text-gold">mesa</span>, sin WhatsApp de por medio.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-mute">
            Entras, pagas, estudias por niveles, demuestras criterio en exámenes y, cuando cumples, el live está en tu panel. Así opera B&amp;B: como campus, no como carpeta de videos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-gold" href="/registro">Empezar mi ruta</Link>
            <Link className="btn-ghost" href="/planes">Ver cómo se paga</Link>
          </div>
          <p className="mt-6 text-xs text-mute">Formación. No hay garantía de ganancia, fondeo ni resultado.</p>
        </div>
        <aside className="card rise" style={{ animationDelay: "120ms" }}>
          <p className="eyebrow">Acceso de entrada</p>
          <p className="mt-4 font-serif text-6xl text-gold2">{entry}</p>
          <p className="mt-2 text-mute">una vez · luego {monthly} / 30 días</p>
          <ul className="mt-8 space-y-3 text-sm text-cream">
            <li className="flex justify-between border-b border-white/10 pb-2"><span>Mesa lun–vie</span><span className="font-mono text-gold">{settings.live_start}–{settings.live_end}</span></li>
            <li className="flex justify-between border-b border-white/10 pb-2"><span>Repaso domingo</span><span className="font-mono text-gold">{settings.review_start}</span></li>
            <li className="flex justify-between"><span>Comunidad por nivel</span><span className="text-mute">dentro del campus</span></li>
          </ul>
        </aside>
      </section>

      <section id="programa" className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">El flujo</p>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl md:text-5xl">Cinco pasos. El equipo no manda enlaces a mano.</h2>
        <div className="mt-10 grid gap-3 md:grid-cols-5">
          {flow.map(([n, title, copy]) => (
            <article key={n} className="glass p-5">
              <p className="font-mono text-xs text-gold">{n}</p>
              <h3 className="mt-3 font-serif text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="niveles" className="mx-auto mt-24 max-w-6xl px-5">
        <p className="eyebrow">Ruta académica</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Tres niveles y la etapa práctica.</h2>
        <div className="mt-10 space-y-3">
          {levels.map((level) => (
            <div key={level.id} className="card grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
              <p className="font-mono text-sm text-gold">Etapa {String(level.sort_order).padStart(2, "0")}</p>
              <div>
                <h3 className="font-serif text-3xl">{level.name}</h3>
                <p className="mt-1 text-mute">{level.summary}</p>
              </div>
              <p className="text-sm text-mute">{level.practical ? "Live + domingo" : "Lecciones + examen"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-4 px-5 md:grid-cols-3">
        {[
          ["Principiante", "Empiezas en Nivel 1. Sin los videos, el examen no se abre."],
          ["Intermedio", "Puedes validar el Nivel 1. Si no apruebas, las lecciones pasan a ser obligatorias."],
          ["Avanzado", "La práctica exige la validación de la academia. Elegir avanzado no la salta."],
        ].map(([title, copy]) => (
          <article key={title} className="card">
            <p className="eyebrow">Diagnóstico</p>
            <h3 className="mt-3 font-serif text-3xl">{title}</h3>
            <p className="mt-3 leading-relaxed text-mute">{copy}</p>
          </article>
        ))}
      </section>

      <section id="mesa" className="mx-auto mt-24 grid max-w-6xl gap-4 px-5 lg:grid-cols-2">
        <article className="card min-h-[280px]">
          <p className="eyebrow">Lunes a viernes</p>
          <h2 className="mt-3 font-serif text-5xl">Trading en vivo</h2>
          <p className="mt-4 max-w-md leading-relaxed text-mute">
            Cuenta regresiva, botón de entrada y acceso controlado en servidor. Si te falta nivel o membresía, ves exactamente qué te falta.
          </p>
        </article>
        <article className="card min-h-[280px]">
          <p className="eyebrow">Domingo</p>
          <h2 className="mt-3 font-serif text-5xl">Repaso de la semana</h2>
          <p className="mt-4 max-w-md leading-relaxed text-mute">
            Operaciones, preguntas, aprobados y el top académico. Un premio, si lo hay, lo confirma una persona. No sale solo ni representa una ganancia.
          </p>
        </article>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <p className="eyebrow">Mesa de profesores</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {teachers.map((teacher) => (
            <article key={teacher.id} className="card">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 font-serif text-2xl text-gold2">
                {teacher.name.replace("Profesor de ", "").slice(0, 1).toUpperCase()}
              </div>
              <h3 className="mt-5 font-serif text-2xl">{teacher.name}</h3>
              <p className="mt-2 leading-relaxed text-mute">{teacher.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="card flex flex-col justify-between gap-8 overflow-hidden md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Entrada</p>
            <h2 className="mt-3 font-serif text-5xl">{entry} + {monthly} el primer mes.</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-mute">
              Los precios se cambian desde administración. Quien ya pagó conserva el monto de su plan. La siguiente mensualidad queda fechada el día del cobro.
            </p>
          </div>
          <Link className="btn-gold" href="/registro">Crear cuenta</Link>
        </div>
      </section>
    </div>
  );
}
