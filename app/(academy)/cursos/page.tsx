import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { courseAccess, examBlockers, examForLevel, levelProgress, levelUnlocked } from "@/lib/access";
import { getExamByCode, listLessons, listLevels } from "@/lib/db";

export const metadata = { title: "Cursos" };

export default async function CursosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const levels = listLevels();
  const advanced = getExamByCode("validacion-avanzada");
  const open = courseAccess(user);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Academia</p>
        <h1 className="mt-2 font-serif text-5xl">Niveles</h1>
      </div>
      {!open && user.role === "student" && (
        <p className="card">El contenido está cerrado hasta completar la inscripción. <Link className="text-gold" href="/checkout">Ir al pago</Link></p>
      )}
      <div className="space-y-4">
        {levels.map((level) => {
          const unlocked = levelUnlocked(user, level);
          const exam = examForLevel(level);
          const lessons = listLessons(level.id);
          return (
            <article key={level.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-3xl">{level.name}</h2>
                  <p className="mt-2 text-mute">{level.summary}</p>
                </div>
                <p className="font-mono text-sm text-gold">{unlocked ? `${levelProgress(user, level)}%` : "Cerrado"}</p>
              </div>
              <ul className="mt-4 space-y-2">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    {unlocked ? (
                      <Link className="text-cream underline decoration-gold/40" href={`/leccion/${lesson.id}`}>{lesson.title}</Link>
                    ) : (
                      <span className="text-mute">{lesson.title}</span>
                    )}
                  </li>
                ))}
              </ul>
              {exam && (
                <div className="mt-4">
                  {unlocked || user.role !== "student" ? (
                    <Link className="btn-ghost" href={`/examen/${exam.id}`}>{exam.title}</Link>
                  ) : (
                    <p className="text-sm text-mute">El examen aparece cuando el nivel se desbloquea.</p>
                  )}
                  {unlocked && examBlockers(user, exam).length > 0 && (
                    <p className="mt-2 text-sm text-mute">{examBlockers(user, exam)[0]}</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
      {advanced && (user.experience === "advanced" || user.role !== "student") && (
        <article className="card">
          <h2 className="font-serif text-3xl">{advanced.title}</h2>
          <p className="mt-2 text-mute">Requisito de la ruta avanzada antes de la etapa práctica. Nota mínima {advanced.min_score}%.</p>
          <Link className="btn-gold mt-4" href={`/examen/${advanced.id}`}>Ir a la validación</Link>
        </article>
      )}
    </div>
  );
}
