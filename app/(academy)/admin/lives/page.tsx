import { deleteBroadcastAction, saveBroadcastAction } from "@/lib/actions/admin";
import { getSettings, listBroadcasts } from "@/lib/db";
import { formatWhen } from "@/lib/format";

export const metadata = { title: "Sesiones" };

export default function LivesPage() {
  const settings = getSettings();
  const items = listBroadcasts();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-5xl">Lives y repasos</h1>
      <p className="text-mute">
        Horario recurrente: lunes a viernes {settings.live_start}–{settings.live_end}. Domingo {settings.review_start}–{settings.review_end}. Los enlaces de la sesión recurrente se editan en configuración o en el panel de profesor.
      </p>
      <form action={saveBroadcastAction} className="card grid gap-3">
        <h2 className="font-serif text-2xl">Guardar grabación o sesión</h2>
        <select className="field" name="kind"><option value="review">Repaso</option><option value="live">Live</option></select>
        <input className="field" name="title" placeholder="Título" required />
        <input className="field" name="starts_at" type="datetime-local" required />
        <input className="field" name="ends_at" type="datetime-local" required />
        <input className="field" name="stream_url" placeholder="Enlace en vivo" />
        <input className="field" name="recording_url" placeholder="Enlace de grabación para la biblioteca" />
        <button className="btn-gold w-fit" type="submit">Guardar</button>
      </form>
      {items.map((item) => (
        <article key={item.id} className="card flex items-center justify-between gap-3">
          <div>
            <p>{item.title}</p>
            <p className="text-sm text-mute">{item.kind} · {formatWhen(item.starts_at, settings.timezone)}</p>
          </div>
          <form action={deleteBroadcastAction}>
            <input type="hidden" name="id" value={item.id} />
            <button className="btn-danger" type="submit">Eliminar</button>
          </form>
        </article>
      ))}
    </div>
  );
}
