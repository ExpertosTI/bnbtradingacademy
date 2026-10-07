import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StudyPlayer } from "@/components/study-player";
import { Locked } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { lessonGate } from "@/lib/access";
import { getLesson, getLevel, progressFor } from "@/lib/db";

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
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <StudyPlayer
        lessonId={lesson.id}
        durationMin={lesson.duration_min}
        initialWatched={progress?.watched_seconds ?? 0}
        initialDone={progress?.completed === 1}
        videoRef={lesson.video_ref}
      />
      <aside>
        <p className="eyebrow">{level.name}</p>
        <h1 className="mt-3 font-serif text-4xl">{lesson.title}</h1>
        <p className="mt-4 text-mute">{lesson.summary}</p>
        <Link className="btn-ghost mt-6" href="/cursos">Volver a los niveles</Link>
      </aside>
    </div>
  );
}
