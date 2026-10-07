import Link from "next/link";
import { redirect } from "next/navigation";
import { publishStreamAction, saveTeacherNoteAction } from "@/lib/actions/admin";
import { getCurrentUser } from "@/lib/auth";
import { academicLevel, stageUnlocked } from "@/lib/access";
import { allGradedAttempts, getSettings, getUser, listStudents } from "@/lib/db";

export const metadata = { title: "Profesor" };

export default async function ProfesorPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) redirect("/dashboard");
  const settings = getSettings();
  const students = listStudents();
  const attempts = allGradedAttempts();
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Mesa</p>
        <h1 className="mt-2 font-serif text-5xl">Panel de profesor</h1>
      </div>
      <form action={publishStreamAction} className="card space-y-3">
        <label className="block"><span className="label">Enlace del trading en vivo</span><input className="field" name="live_stream_url" defaultValue={settings.live_stream_url} /></label>
        <label className="block"><span className="label">Enlace del repaso</span><input className="field" name="review_stream_url" defaultValue={settings.review_stream_url} /></label>
        <button className="btn-gold" type="submit">Publicar accesos</button>
      </form>
      <form action={saveTeacherNoteAction} className="card space-y-3">
        <label className="block"><span className="label">Nombre visible</span><input className="field" name="name" defaultValue={user.name} /></label>
        <label className="block"><span className="label">Bio</span><textarea className="field" name="bio" defaultValue={user.bio} rows={3} /></label>
        <button className="btn-ghost" type="submit">Guardar perfil</button>
      </form>
      <section className="card overflow-x-auto">
        <h2 className="font-serif text-3xl">Alumnos</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-mute"><tr><th>Nombre</th><th>Ruta</th><th>Nivel</th><th>Último examen</th></tr></thead>
          <tbody>
            {students.map((student) => {
              const full = getUser(student.id);
              const last = attempts.find((attempt) => attempt.user_id === student.id);
              return (
                <tr key={student.id} className="border-t border-white/5">
                  <td className="py-2">{student.name}</td>
                  <td>{student.experience}</td>
                  <td>{full ? (stageUnlocked(full) ? "Práctica" : `Nivel ${academicLevel(full)}`) : "—"}</td>
                  <td>{last ? `${last.title} ${last.percent}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Link className="mt-4 inline-block text-gold" href="/comunidad/anuncios">Publicar anuncio</Link>
      </section>
    </div>
  );
}
