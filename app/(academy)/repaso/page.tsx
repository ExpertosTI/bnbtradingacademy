import { Countdown } from "@/components/countdown";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isStaff, premiumMembership } from "@/lib/access";
import { getSettings, listBroadcasts, passedSince, prizesForWeek, weekRanking } from "@/lib/db";
import { formatDay, startOfIsoWeek, weekKey } from "@/lib/format";
import { nextWindow } from "@/lib/schedule";

export const metadata = { title: "Repaso semanal" };

export default async function RepasoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = getSettings();
  const window = nextWindow(new Date(), settings.timezone, [0], settings.review_start, settings.review_end);
  const allowed = isStaff(user) || premiumMembership(user);
  const from = startOfIsoWeek().toISOString();
  const passed = passedSince(from);
  const ranking = weekRanking(from);
  const prizes = prizesForWeek(weekKey());
  const recordings = listBroadcasts("review").filter((item) => item.recording_url);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Domingo</p>
        <h1 className="mt-2 font-serif text-5xl">Repaso de la semana</h1>
        <p className="mt-3 text-mute">{formatDay(window.start.toISOString(), settings.timezone)}</p>
      </div>
      <section className="card">
        {window.state === "upcoming" && <Countdown target={window.start.toISOString()} label="El repaso empieza en" />}
        {window.state === "live" && allowed && settings.review_stream_url && (
          <a className="btn-gold" href={settings.review_stream_url} target="_blank" rel="noreferrer">Entrar al repaso</a>
        )}
        {window.state === "live" && allowed && !settings.review_stream_url && <p>El horario está abierto. Falta el enlace de la sesión.</p>}
        {!allowed && <p>El repaso en vivo y su biblioteca son para miembros con la etapa práctica y la membresía activa.</p>}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="card">
          <h2 className="font-serif text-3xl">Aprobaron esta semana</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {passed.length === 0 && <li className="text-mute">Nadie ha aprobado en esta semana.</li>}
            {passed.map((row) => (
              <li key={`${row.user_id}-${row.finished_at}`}>{row.name} · {row.title} · {row.percent}%</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2 className="font-serif text-3xl">Top académico</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {ranking.length === 0 && <li className="text-mute">El ranking se arma con exámenes aprobados de la semana.</li>}
            {ranking.slice(0, 8).map((row, index) => (
              <li key={row.userId}>{index + 1}. {row.name} · {row.best}%</li>
            ))}
          </ol>
          <ul className="mt-4 text-sm text-gold2">
            {prizes.map((prize) => <li key={prize.id}>{prize.name}: {prize.title}</li>)}
          </ul>
          <p className="mt-3 text-xs text-mute">Si hay premio, administración lo confirma. No sale solo ni representa una ganancia.</p>
        </article>
      </section>
      <section className="card">
        <h2 className="font-serif text-3xl">Biblioteca</h2>
        {!allowed && <p className="mt-3 text-mute">Cerrada hasta tener la membresía y la etapa práctica.</p>}
        {allowed && recordings.length === 0 && <p className="mt-3 text-mute">Cuando administración guarde una grabación, aparece aquí.</p>}
        {allowed && (
          <ul className="mt-4 space-y-2">
            {recordings.map((item) => (
              <li key={item.id}><a className="text-gold" href={item.recording_url}>{item.title}</a></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
