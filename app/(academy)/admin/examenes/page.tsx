import Link from "next/link";
import { listExams, questionsFor } from "@/lib/db";

export const metadata = { title: "Exámenes" };

export default function ExamenesPage() {
  const exams = listExams();
  return (
    <div>
      <h1 className="font-serif text-5xl">Exámenes</h1>
      <div className="mt-6 space-y-3">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/admin/examenes/${exam.id}`} className="card block">
            <p className="font-serif text-2xl">{exam.title}</p>
            <p className="mt-1 text-sm text-mute">Mínimo {exam.min_score}% · {exam.time_limit_min} min · {questionsFor(exam.id).length} preguntas · espera {exam.cooldown_hours} h</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
