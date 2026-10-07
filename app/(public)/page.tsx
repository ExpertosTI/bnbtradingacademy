import Link from "next/link";
import { experienceLabel, money } from "@/lib/format";
import { getSettings, listLevels, listTeachers } from "@/lib/db";

export default function HomePage() {
  const settings = getSettings();
  const levels = listLevels();
  const teachers = listTeachers();
  const entry = money(settings.entry_price_cents, settings.currency);
  const monthly = money(settings.monthly_price_cents, settings.currency);

  return (
    <div className="relative z-10">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.3fr_0.7fr] md:items-end">
        <div>
          <p className="eyebrow">Academia de formación</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] text-cream md:text-7xl">
            Entras, estudias por niveles y la mesa se abre <span className="italic text-gold">dentro</span> de la plataforma.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-mute">
            Registro, pago, lecciones, exámenes y trading en vivo sin que el equipo tenga que enviar enlaces a mano.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-gold" href="/registro">Empezar la ruta</Link>
            <Link className="btn-ghost" href="/planes">Ver precios</Link>
          </div>
        </div>
        <aside className="card">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-mute">Entrada de hoy</p>
          <p className="mt-3 font-serif text-5xl">{entry}</p>
          <p className="mt-2 text-mute">inscripción + {monthly} el primer mes</p>
          <p className="mt-6 border-t border-white/10 pt-4 text-sm text-mute">
            Mesa de lunes a viernes, {settings.live_start} a {settings.live_end}. Repaso dominical {settings.review_start}.
          </p>
        </aside>
      </section>

      <section id="programa" className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-3">
        {[
          ["Principiante", "Empieza en Nivel 1. Los videos son obligatorios antes del examen."],
          ["Intermedio", "Puede validar el Nivel 1. Si aprueba, entra al Nivel 2. Si no, completa las lecciones."],
          ["Avanzado", "No salta a la práctica al registrarse. Debe aprobar la validación definida por la academia."],
        ].map(([title, copy]) => (
          <article key={title} className="card">
            <p className="eyebrow">Ruta</p>
            <h2 className="mt-3 font-serif text-3xl">{title}</h2>
            <p className="mt-3 text-mute">{copy}</p>
          </article>
        ))}
      </section>

      <section id="niveles" className="mx-auto mt-16 max-w-6xl px-5">
        <p className="eyebrow">Estructura</p>
        <h2 className="mt-3 font-serif text-4xl">Cuatro etapas, un perfil que guarda el avance.</h2>
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {levels.map((level) => (
            <div key={level.id} className="grid gap-3 py-5 md:grid-cols-[180px_1fr]">
              <p className="font-mono text-sm text-gold">{String(level.sort_order).padStart(2, "0")}</p>
              <div>
                <h3 className="font-serif text-2xl">{level.name}</h3>
                <p className="mt-1 text-mute">{level.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="mesa" className="mx-auto mt-16 grid max-w-6xl gap-4 px-5 md:grid-cols-2">
        <article className="card">
          <p className="eyebrow">Lunes a viernes</p>
          <h2 className="mt-3 font-serif text-4xl">Trading en vivo</h2>
          <p className="mt-3 text-mute">
            Quien ya cumplió el nivel y tiene la membresía activa ve la sesión y el botón de entrada. Los demás ven qué les falta.
          </p>
        </article>
        <article className="card">
          <p className="eyebrow">Domingo</p>
          <h2 className="mt-3 font-serif text-4xl">Repaso de la semana</h2>
          <p className="mt-3 text-mute">
            Operaciones de la semana, preguntas, aprobados y el top académico. El premio lo confirma administración: no se entrega solo.
          </p>
        </article>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <p className="eyebrow">Profesores</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {teachers.map((teacher) => (
            <article key={teacher.id} className="card">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 font-serif text-xl">
                {teacher.name.slice(0, 1)}
              </div>
              <h3 className="mt-4 font-serif text-2xl">{teacher.name}</h3>
              <p className="mt-2 text-sm text-mute">{teacher.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="card flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Precio configurable</p>
            <h2 className="mt-3 font-serif text-4xl">{entry} de entrada y {monthly} al mes.</h2>
            <p className="mt-3 max-w-xl text-mute">
              Los precios viven en el panel. Un cambio aplica a miembros nuevos; quien ya pagó conserva el monto de su plan.
              Declarar {experienceLabel("advanced").toLowerCase()} no omite pagos ni exámenes.
            </p>
          </div>
          <Link className="btn-gold" href="/registro">Crear cuenta</Link>
        </div>
        <p className="mt-6 text-sm text-mute">
          La formación no es una recomendación de compra o venta. Resultados pasados, premios o cuentas de ejemplo no son garantía de ganancias.
        </p>
      </section>
    </div>
  );
}
