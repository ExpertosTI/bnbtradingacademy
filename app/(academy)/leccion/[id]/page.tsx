import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StudyPlayer } from "@/components/study-player";
import { Locked } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { examForLevel, lessonGate } from "@/lib/access";
import { getLesson, getLevel, listLessons, progressFor } from "@/lib/db";

export default async function LeccionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const lesson = getLesson(Number(id));
  if (!lesson) notFound();
  const level = getLevel(lesson.level_id);
  if (!level) notFound();
  const gate = lessonGate(user, lesson, level);
  if (gate && user.role === "student") return <Locked title={lesson.title} reasons={[gate]} />;
  const progress = progressFor(user.id, lesson.id);
  const siblings = listLessons(level.id);
  const index = siblings.findIndex((item) => item.id === lesson.id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  const exam = examForLevel(level);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.5fr]">
      <div>
        <StudyPlayer
          lessonId={lesson.id}
          durationMin={lesson.duration_min}
          initialWatched={progress?.watched_seconds ?? 0}
          initialDone={progress?.completed === 1}
          videoRef={lesson.video_ref}
        />
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          {prev ? <Link className="btn-ghost" href={`/leccion/${prev.id}`}>Anterior</Link> : <span />}
          {next ? (
            <Link className="btn-gold" href={`/leccion/${next.id}`}>Siguiente lección</Link>
          ) : exam ? (
            <Link className="btn-gold" href={`/examen/${exam.id}`}>Ir al examen</Link>
          ) : (
            <Link className="btn-gold" href="/cursos">Volver a la ruta</Link>
          )}
        </div>
      </div>
      <aside className="card h-fit">
        <p className="eyebrow">{level.name}</p>
        <h1 className="mt-3 font-serif text-4xl">{lesson.title}</h1>
        <p className="mt-4 leading-relaxed text-mute">{lesson.summary}</p>
        <p className="mt-6 font-mono text-xs text-gold">Lección {index + 1} de {siblings.length}</p>
        <ol className="mt-4 space-y-2 text-sm">
          {siblings.map((item) => (
            <li key={item.id}>
              <Link className={item.id === lesson.id ? "text-gold" : "text-mute hover:text-cream"} href={`/leccion/${item.id}`}>
                {item.title}
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
