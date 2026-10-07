import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { answerRows, getAttempt } from "@/lib/db";

export default async function ResultadoPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { attemptId } = await params;
  const attempt = getAttempt(Number(attemptId));
  if (!attempt || (attempt.user_id !== user.id && user.role === "student")) notFound();
  const answers = answerRows(attempt.id);
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Resultado</p>
      <h1 className="mt-3 font-serif text-5xl">{attempt.passed ? "Aprobado" : "Reprobado"}</h1>
      <p className="mt-3 font-mono text-2xl text-gold">{attempt.percent}% · {attempt.score}/{attempt.max_score} puntos</p>
      <p className="mt-2 text-sm text-mute">Tiempo usado: {Math.ceil(attempt.duration_sec / 60)} min. Nota mínima {attempt.min_score}%.</p>
      <ul className="mt-6 space-y-3">
        {answers.map((answer) => (
          <li key={answer.question_id} className="card">
            <p>{answer.prompt}</p>
            <p className="mt-2 text-sm text-mute">{answer.correct ? "Correcta" : "Incorrecta"} · {answer.label || "Sin respuesta"} · {answer.points_earned} pts</p>
          </li>
        ))}
      </ul>
      <Link className="btn-gold mt-6" href="/cursos">Seguir la ruta</Link>
    </div>
  );
}
