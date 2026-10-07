import { notFound } from "next/navigation";
import { addQuestionAction, deleteQuestionAction, saveExamAction, updateQuestionAction } from "@/lib/actions/admin";
import { getExam, optionsFor, questionsFor } from "@/lib/db";

export default async function ExamenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(Number(id));
  if (!exam) notFound();
  const questions = questionsFor(exam.id);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-5xl">{exam.title}</h1>
      <form action={saveExamAction} className="card grid gap-3 md:grid-cols-2">
        <input type="hidden" name="id" value={exam.id} />
        <label className="block"><span className="label">Título</span><input className="field" name="title" defaultValue={exam.title} /></label>
        <label className="block"><span className="label">Nota mínima</span><input className="field" name="min_score" type="number" defaultValue={exam.min_score} /></label>
        <label className="block"><span className="label">Espera para repetir (horas)</span><input className="field" name="cooldown_hours" type="number" defaultValue={exam.cooldown_hours} /></label>
        <label className="block"><span className="label">Tiempo (min)</span><input className="field" name="time_limit_min" type="number" defaultValue={exam.time_limit_min} /></label>
        <label className="block"><span className="label">Precio propio (USD, 0 si va incluido)</span><input className="field" name="price" type="number" step="0.01" defaultValue={(exam.price_cents / 100).toFixed(2)} /></label>
        <button className="btn-gold w-fit" type="submit">Guardar examen</button>
      </form>
      {questions.map((question) => {
        const options = optionsFor(question.id);
        const correct = options.findIndex((option) => option.is_correct === 1) + 1;
        return (
          <form key={question.id} action={updateQuestionAction} className="card grid gap-2">
            <input type="hidden" name="id" value={question.id} />
            <textarea className="field" name="prompt" defaultValue={question.prompt} rows={2} />
            <input className="field" name="points" type="number" defaultValue={question.points} />
            {options.map((option, index) => (
              <input key={option.id} className="field" name={`option_${index + 1}`} defaultValue={option.label} />
            ))}
            <label className="text-sm text-mute">Respuesta correcta (1 a {options.length})
              <input className="field mt-1" name="correct" type="number" min={1} max={4} defaultValue={correct} />
            </label>
            <button className="btn-ghost w-fit" type="submit">Modificar pregunta</button>
          </form>
        );
      })}
      {questions.map((question) => (
        <form key={`del-${question.id}`} action={deleteQuestionAction}>
          <input type="hidden" name="id" value={question.id} />
          <button className="text-xs text-bad" type="submit">Eliminar pregunta {question.id}</button>
        </form>
      ))}
      <form action={addQuestionAction} className="card grid gap-2">
        <h2 className="font-serif text-2xl">Nueva pregunta</h2>
        <input type="hidden" name="exam_id" value={exam.id} />
        <textarea className="field" name="prompt" required rows={2} />
        <select className="field" name="kind"><option value="mc">Selección múltiple</option><option value="tf">Verdadero / falso</option></select>
        <input className="field" name="points" type="number" defaultValue={20} />
        <input className="field" name="option_1" placeholder="Opción 1" required />
        <input className="field" name="option_2" placeholder="Opción 2" required />
        <input className="field" name="option_3" placeholder="Opción 3" />
        <input className="field" name="option_4" placeholder="Opción 4" />
        <input className="field" name="correct" type="number" min={1} max={4} defaultValue={1} />
        <button className="btn-gold w-fit" type="submit">Agregar al banco</button>
      </form>
    </div>
  );
}
