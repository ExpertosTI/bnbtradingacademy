import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { allProgress, getExamByCode, listLessons, listLevels } from "@/lib/db";
import { courseAccess, examBlockers, examForLevel, levelProgress, levelUnlocked } from "@/lib/access";

export const metadata = { title: "Ruta" };

export default async function CursosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const levels = listLevels();
  const advanced = getExamByCode("validacion-avanzada");
  const open = courseAccess(user);
  const progress = allProgress(user.id);

  return (
    <div className="space-y-8">
        <div>
          <p className="eyebrow">Campus</p>
          <h1 className="mt-2 font-serif text-5xl md:text-7xl">Tu ruta</h1>
          <p className="mt-4 max-w-2xl text-mute">Cada nivel se abre al aprobar el anterior. Las lecciones quedan registradas. El examen no aparece por un enlace de WhatsApp.</p>
        </div>
      {!open && user.role === "student" && (
        <p className="card">El contenido se abre con la inscripción. <Link className="text-gold" href="/checkout">Completar el pago</Link></p>
      )}
      <div className="relative space-y-6 before:absolute before:bottom-8 before:left-[19px] before:top-8 before:w-px before:bg-gold/20">
        {levels.map((level) => {
          const unlocked = levelUnlocked(user, level);
          const exam = examForLevel(level);
          const lessons = listLessons(level.id);
          const pct = levelProgress(user, level);
          const blockers = exam ? examBlockers(user, exam) : [];
          return (
            <article key={level.id} className="relative pl-12">
              <span className={`absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-full border ${unlocked ? "border-gold bg-gold/20 text-gold" : "border-white/15 text-mute"}`}>
                {unlocked ? <Check size={16} /> : <Lock size={14} />}
              </span>
              <div className="card">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="font-serif text-4xl italic text-gold/70">{String(level.sort_order).padStart(2, "0")}</p>
                    <h2 className="mt-1 font-serif text-3xl md:text-4xl">{level.name}</h2>
                    <p className="mt-2 max-w-2xl text-mute">{level.summary}</p>
                  </div>
                  <p className="font-mono text-sm uppercase tracking-[0.16em] text-gold">{unlocked ? `${pct}%` : "Cerrado"}</p>
                </div>
                {unlocked && <div className="progress-bar mt-5"><span style={{ width: `${pct}%` }} /></div>}
                <ul className="mt-5 divide-y divide-white/5">
                  {lessons.map((lesson) => {
                    const done = progress.some((item) => item.lesson_id === lesson.id && item.completed === 1);
                    return (
                      <li key={lesson.id} className="flex items-center justify-between gap-3 py-3">
                        {unlocked ? (
                          <Link className="text-cream hover:text-gold" href={`/leccion/${lesson.id}`}>{lesson.title}</Link>
                        ) : (
                          <span className="text-mute">{lesson.title}</span>
                        )}
                        <span className="font-mono text-[11px] text-mute">{done ? "visto" : `${lesson.duration_min} min`}</span>
                      </li>
                    );
                  })}
                </ul>
                {exam && (
                  <div className="mt-5">
                    {unlocked || user.role !== "student" ? (
                      <Link className="btn-gold" href={`/examen/${exam.id}`}>{exam.title}</Link>
                    ) : (
                      <p className="text-sm text-mute">El examen se habilita al desbloquear este nivel.</p>
                    )}
                    {unlocked && blockers[0] && <p className="mt-3 text-sm text-mute">{blockers[0]}</p>}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {advanced && (user.experience === "advanced" || user.role !== "student") && (
        <article className="card">
          <p className="eyebrow">Ruta avanzada</p>
          <h2 className="mt-2 font-serif text-3xl">{advanced.title}</h2>
          <p className="mt-2 text-mute">Requisito antes de la etapa práctica. Nota mínima {advanced.min_score}%.</p>
          <Link className="btn-gold mt-5" href={`/examen/${advanced.id}`}>Ir a la validación</Link>
        </article>
      )}
    </div>
  );
}
