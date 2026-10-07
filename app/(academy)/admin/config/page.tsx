import { saveSettingsAction } from "@/lib/actions/admin";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Configuración" };

export default function ConfigPage() {
  const settings = getSettings();
  return (
    <form action={saveSettingsAction} className="card grid max-w-3xl gap-3">
      <h1 className="font-serif text-5xl">Configuración</h1>
      <label className="block"><span className="label">Nombre</span><input className="field" name="academy_name" defaultValue={settings.academy_name} /></label>
      <label className="block"><span className="label">Inscripción USD</span><input className="field" name="entry_price" type="number" step="0.01" defaultValue={(settings.entry_price_cents / 100).toFixed(2)} /></label>
      <label className="block"><span className="label">Mensualidad USD para miembros nuevos</span><input className="field" name="monthly_price" type="number" step="0.01" defaultValue={(settings.monthly_price_cents / 100).toFixed(2)} /></label>
      <label className="block"><span className="label">Zona horaria</span><input className="field" name="timezone" defaultValue={settings.timezone} /></label>
      <div className="grid gap-3 md:grid-cols-3">
        <input className="field" name="live_days" defaultValue={settings.live_days} />
        <input className="field" name="live_start" defaultValue={settings.live_start} />
        <input className="field" name="live_end" defaultValue={settings.live_end} />
      </div>
      <input className="field" name="live_stream_url" placeholder="Enlace del live" defaultValue={settings.live_stream_url} />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="field" name="review_start" defaultValue={settings.review_start} />
        <input className="field" name="review_end" defaultValue={settings.review_end} />
      </div>
      <input className="field" name="review_stream_url" placeholder="Enlace del domingo" defaultValue={settings.review_stream_url} />
      <label className="block"><span className="label">Porcentaje mínimo de visualización (0.8 = 80%)</span><input className="field" name="min_watch_ratio" type="number" step="0.05" min={0.1} max={1} defaultValue={settings.min_watch_ratio} /></label>
      <label className="block"><span className="label">Si la mensualidad vence</span>
        <select className="field" name="expire_locks" defaultValue={settings.expire_locks}>
          <option value="premium">Suspender solo premium, live y repaso</option>
          <option value="all">Suspender también las lecciones</option>
        </select>
      </label>
      <button className="btn-gold w-fit" type="submit">Guardar sin tocar código</button>
    </form>
  );
}
