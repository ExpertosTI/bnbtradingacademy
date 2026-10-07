import { adminDeleteMessageAction, moderateUserAction, resolveReportAction } from "@/lib/actions/admin";
import { listReports, listStudents, recentMessages } from "@/lib/db";

export const metadata = { title: "Moderación" };

export default function ComunidadAdminPage() {
  const reports = listReports();
  const messages = recentMessages();
  const students = listStudents();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-5xl">Moderación</h1>
      <section className="space-y-3">
        {reports.map((report) => (
          <article key={report.id} className="card">
            <p className="text-sm text-mute">{report.name} · {report.reason}</p>
            <p className="mt-2">{report.body || "Mensaje ya retirado"}</p>
            <form action={resolveReportAction} className="mt-3">
              <input type="hidden" name="id" value={report.id} />
              <button className="btn-ghost" type="submit">{report.resolved ? "Resuelto" : "Marcar resuelto"}</button>
            </form>
          </article>
        ))}
        {reports.length === 0 && <p className="text-mute">No hay reportes.</p>}
      </section>
      <section className="card space-y-3">
        <h2 className="font-serif text-2xl">Mensajes recientes</h2>
        {messages.map((message) => (
          <form key={message.id} action={adminDeleteMessageAction} className="flex items-center justify-between gap-3 border-b border-white/5 py-2">
            <input type="hidden" name="message_id" value={message.id} />
            <p className="text-sm">{message.name} en {message.slug}: {message.deleted ? "retirado" : message.body}</p>
            <button className="text-xs text-bad" type="submit">Retirar</button>
          </form>
        ))}
      </section>
      <section className="space-y-3">
        {students.map((student) => (
          <form key={student.id} action={moderateUserAction} className="card flex flex-wrap items-center justify-between gap-3">
            <input type="hidden" name="user_id" value={student.id} />
            <p>{student.name} {student.muted_until ? `· silenciado hasta ${student.muted_until.slice(0, 16)}` : ""}</p>
            <div className="flex gap-2">
              <button className="btn-ghost" name="action" value="mute" type="submit">Silenciar 24 h</button>
              <button className="btn-ghost" name="action" value="unmute" type="submit">Quitar silencio</button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
