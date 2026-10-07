import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { startExamAction } from "@/lib/actions/learn";
import { payExamAction } from "@/lib/actions/billing";
import { ExamRunner } from "@/components/exam-runner";
import { getCurrentUser } from "@/lib/auth";
import { examBlockers } from "@/lib/access";
import { bestAttempt, getAttempt, getExam, getSettings, hasPaid, publicExam } from "@/lib/db";
import { money } from "@/lib/format";

export default async function ExamenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ intento?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const query = await searchParams;
  const exam = getExam(Number(id));
  if (!exam) notFound();
  const settings = getSettings();
  const blockers = examBlockers(user, exam);
  const best = bestAttempt(user.id, exam.id);

  if (query.intento && blockers.length === 0) {
    const attempt = getAttempt(Number(query.intento));
    if (attempt && attempt.user_id === user.id && attempt.status === "in_progress") {
      const left = exam.time_limit_min * 60 - Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
      return <ExamRunner attemptId={attempt.id} title={exam.title} secondsLeft={Math.max(1, left)} questions={publicExam(exam.id)} />;
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="eyebrow">Evaluación</p>
      <h1 className="font-serif text-5xl">{exam.title}</h1>
      <p className="text-mute">Nota mínima {exam.min_score}%. Tiempo {exam.time_limit_min} min. {exam.cooldown_hours > 0 ? `Espera de ${exam.cooldown_hours} h para repetir.` : "Sin espera obligatoria para repetir."}</p>
      {best && <p className="font-mono text-sm text-gold">Mejor puntuación: {best.percent}% · intentos quedan en tu perfil</p>}
      {blockers.map((reason) => <p key={reason} className="card text-mute">{reason}</p>)}
      {exam.price_cents > 0 && !hasPaid(user.id, `exam:${exam.code}`) && user.role === "student" && (
        <form action={payExamAction}>
          <input type="hidden" name="exam_id" value={exam.id} />
          <button className="btn-gold" type="submit">Pagar {money(exam.price_cents, settings.currency)} y habilitar</button>
        </form>
      )}
      {blockers.length === 0 && (
        <form action={startExamAction.bind(null, exam.id)}>
          <button className="btn-gold" type="submit">Comenzar examen</button>
        </form>
      )}
      <Link className="text-sm text-mute" href="/cursos">Volver</Link>
    </div>
  );
}
