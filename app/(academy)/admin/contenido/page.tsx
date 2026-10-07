import { deleteLessonAction, saveLessonAction, saveLevelAction } from "@/lib/actions/admin";
import { listLessons, listLevels } from "@/lib/db";

export const metadata = { title: "Contenido" };

export default function ContenidoPage() {
  const levels = listLevels();
  const lessons = listLessons();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-5xl">Contenido</h1>
      {levels.map((level) => (
        <section key={level.id} className="card space-y-4">
          <form action={saveLevelAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="id" value={level.id} />
            <input className="field" name="name" defaultValue={level.name} />
            <input className="field" name="summary" defaultValue={level.summary} />
            <button className="btn-ghost w-fit" type="submit">Guardar nivel</button>
          </form>
          {lessons.filter((lesson) => lesson.level_id === level.id).map((lesson) => (
            <form key={lesson.id} action={saveLessonAction} className="grid gap-2 border-t border-white/10 pt-3 md:grid-cols-2">
              <input type="hidden" name="id" value={lesson.id} />
              <input type="hidden" name="level_id" value={level.id} />
              <input className="field" name="title" defaultValue={lesson.title} />
              <input className="field" name="duration_min" type="number" min={1} defaultValue={lesson.duration_min} />
              <input className="field md:col-span-2" name="summary" defaultValue={lesson.summary} />
              <input className="field md:col-span-2" name="video_ref" placeholder="Enlace de video, solo visible con acceso" defaultValue={lesson.video_ref} />
              <button className="btn-ghost w-fit" type="submit">Guardar lección</button>
            </form>
          ))}
          {lessons.filter((lesson) => lesson.level_id === level.id).map((lesson) => (
            <form key={`del-${lesson.id}`} action={deleteLessonAction}>
              <input type="hidden" name="id" value={lesson.id} />
              <button className="text-xs text-bad" type="submit">Eliminar {lesson.title}</button>
            </form>
          ))}
        </section>
      ))}
      <form action={saveLessonAction} className="card grid gap-3">
        <h2 className="font-serif text-2xl">Nueva lección</h2>
        <select className="field" name="level_id">
          {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
        </select>
        <input className="field" name="title" placeholder="Título" required />
        <input className="field" name="summary" placeholder="Resumen" required />
        <input className="field" name="duration_min" type="number" min={1} defaultValue={10} />
        <input className="field" name="video_ref" placeholder="Enlace opcional" />
        <button className="btn-gold w-fit" type="submit">Crear</button>
      </form>
    </div>
  );
}
