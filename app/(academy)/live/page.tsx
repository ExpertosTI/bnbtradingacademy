import { Countdown } from "@/components/countdown";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isStaff, liveRequirements } from "@/lib/access";
import { getSettings } from "@/lib/db";
import { formatDay } from "@/lib/format";
import { nextWindow, parseDays } from "@/lib/schedule";

export const metadata = { title: "Trading en vivo" };

export default async function LivePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = getSettings();
  const window = nextWindow(new Date(), settings.timezone, parseDays(settings.live_days), settings.live_start, settings.live_end);
  const missing = isStaff(user) ? [] : liveRequirements(user);
  const open = missing.length === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Lunes a viernes</p>
      <h1 className="mt-3 font-serif text-5xl">Trading en vivo</h1>
      <p className="mt-3 text-mute">{formatDay(window.start.toISOString(), settings.timezone)} · {settings.live_start} a {settings.live_end}</p>
      <section className="card mt-8">
        {window.state === "upcoming" && <Countdown target={window.start.toISOString()} label="La mesa abre en" />}
        {window.state === "live" && open && settings.live_stream_url && (
          <a className="btn-gold" href={settings.live_stream_url} target="_blank" rel="noreferrer">Entrar al live</a>
        )}
        {window.state === "live" && open && !settings.live_stream_url && (
          <p>La sesión está en horario, pero el profesor todavía no publica el acceso.</p>
        )}
        {!open && (
          <div>
            <p className="font-serif text-2xl">Te falta esto para entrar</p>
            <ul className="mt-3 space-y-1 text-mute">{missing.map((item) => <li key={item}>— {item}</li>)}</ul>
          </div>
        )}
      </section>
      <p className="mt-6 text-sm text-mute">La mesa es formación en vivo. Ver una operación no es una instrucción de compra ni una garantía de resultado.</p>
    </div>
  );
}
