import Link from "next/link";
import { redirect } from "next/navigation";
import { Countdown } from "@/components/countdown";
import { getCurrentUser } from "@/lib/auth";
import { isStaff, liveRequirements, stageUnlocked, premiumMembership } from "@/lib/access";
import { getSettings } from "@/lib/db";
import { formatDay } from "@/lib/format";
import { nextWindow, parseDays } from "@/lib/schedule";

export const metadata = { title: "Mesa en vivo" };

export default async function LivePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = getSettings();
  const window = nextWindow(new Date(), settings.timezone, parseDays(settings.live_days), settings.live_start, settings.live_end);
  const missing = isStaff(user) ? [] : liveRequirements(user);
  const open = missing.length === 0;
  const checks = [
    { ok: premiumMembership(user), label: "Membresía activa" },
    { ok: stageUnlocked(user), label: user.experience === "advanced" ? "Validación avanzada aprobada" : "Nivel 3 aprobado" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Lunes a viernes</p>
          <h1 className="mt-2 font-serif text-5xl">Mesa en vivo</h1>
          <p className="mt-3 text-mute">{formatDay(window.start.toISOString(), settings.timezone)} · {settings.live_start} – {settings.live_end}</p>
        </div>
        {window.state === "live" && <span className="inline-flex items-center gap-2 text-sm text-bad"><span className="live-dot" /> Sesión en horario</span>}
      </div>
      <section className="card min-h-[280px]">
        {window.state === "upcoming" && <Countdown target={window.start.toISOString()} label="La mesa abre en" />}
        {window.state === "live" && open && settings.live_stream_url && (
          <div className="space-y-4">
            <p className="text-mute">El enlace está publicado. Entras aquí, no por un chat externo.</p>
            <a className="btn-gold" href={settings.live_stream_url} target="_blank" rel="noreferrer">Entrar al live</a>
          </div>
        )}
        {window.state === "live" && open && !settings.live_stream_url && (
          <p>Estás autorizado y el horario está abierto. El profesor todavía no publica el acceso de esta sesión.</p>
        )}
        {!open && (
          <div>
            <p className="font-serif text-3xl">Sala de espera</p>
            <p className="mt-2 text-mute">La mesa es para quien ya cumplió la ruta y tiene la membresía activa.</p>
            <ul className="mt-6 space-y-3">
              {checks.map((check) => (
                <li key={check.label} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                  <span>{check.label}</span>
                  <span className={check.ok ? "text-good" : "text-bad"}>{check.ok ? "Listo" : "Pendiente"}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <Link className="btn-gold" href="/cursos">Seguir la ruta</Link>
              <Link className="btn-ghost" href="/pagos">Membresía</Link>
            </div>
          </div>
        )}
      </section>
      <p className="text-sm text-mute">Ver una operación en vivo no es una instrucción de compra ni una garantía de resultado. Anota; no copies el lote.</p>
    </div>
  );
}
