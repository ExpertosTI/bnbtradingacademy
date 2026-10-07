import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  academicLevel,
  continueLesson,
  courseAccess,
  currentLevelLabel,
  levelProgress,
  liveRequirements,
  membershipGrants,
  membershipOf,
  premiumMembership,
  stageUnlocked,
} from "@/lib/access";
import { attemptsForUser, badgesFor, getSettings, listLevels, prizesForUser, weekRanking } from "@/lib/db";
import { experienceLabel, formatDay, membershipLabel, money, startOfIsoWeek } from "@/lib/format";
import { nextWindow, parseDays } from "@/lib/schedule";

export const metadata = { title: "Inicio" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = getSettings();
  const membership = membershipOf(user);
  const levels = listLevels();
  const current = levels.find((level) => level.name === currentLevelLabel(user)) || levels[0];
  const lesson = continueLesson(user);
  const attempts = attemptsForUser(user.id).filter((attempt) => attempt.status === "graded");
  const badges = badgesFor(user.id);
  const prizes = prizesForUser(user.id);
  const ranking = weekRanking(startOfIsoWeek().toISOString());
  const place = ranking.findIndex((row) => row.userId === user.id);
  const live = nextWindow(new Date(), settings.timezone, parseDays(settings.live_days), settings.live_start, settings.live_end);
  const review = nextWindow(new Date(), settings.timezone, [0], settings.review_start, settings.review_end);
  const paid = courseAccess(user);
  const liveReady = liveRequirements(user).length === 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
        <div className="card">
          <p className="eyebrow">Tu escritorio</p>
          <h1 className="mt-3 font-serif text-5xl">Hola, {user.name.split(" ")[0]}.</h1>
          <p className="mt-3 text-mute">
            {experienceLabel(user.experience)} · {currentLevelLabel(user)} · {current ? `${levelProgress(user, current)}% de las lecciones de esta etapa` : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {lesson && paid ? (
              <Link className="btn-gold" href={`/leccion/${lesson.id}`}>Continuar: {lesson.title}</Link>
            ) : (
              <Link className="btn-gold" href={paid ? "/cursos" : "/checkout"}>
                {paid ? "Ver cursos" : "Completar el pago"}
              </Link>
            )}
            <Link className="btn-ghost" href="/cursos">Ruta completa</Link>
          </div>
        </div>
        <div className="card">
          <p className="eyebrow">Membresía</p>
          <p className="mt-3 font-serif text-3xl">{membershipLabel(membership?.status)}</p>
          <p className="mt-2 text-sm text-mute">
            {membership?.amount_cents ? `${money(membership.amount_cents, membership.currency)} · próximo cobro ${formatDay(membership.next_charge_at || "", settings.timezone)}` : "Sin plan activo"}
          </p>
          {!membershipGrants(membership) && user.role === "student" && (
            <Link className="btn-gold mt-4" href="/checkout">Renovar</Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card">
          <p className="eyebrow">Trading en vivo</p>
          <h2 className="mt-2 font-serif text-3xl">{formatDay(live.start.toISOString(), settings.timezone)}</h2>
          {live.state === "upcoming" && <div className="mt-4"><Countdown target={live.start.toISOString()} label="Abre en" /></div>}
          {live.state === "live" && liveReady && <Link className="btn-gold mt-4" href="/live">Entrar al live</Link>}
          {!liveReady && user.role === "student" && (
            <ul className="mt-4 text-sm text-mute">{liveRequirements(user).map((item) => <li key={item}>— {item}</li>)}</ul>
          )}
        </article>
        <article className="card">
          <p className="eyebrow">Repaso del domingo</p>
          <h2 className="mt-2 font-serif text-3xl">{formatDay(review.start.toISOString(), settings.timezone)}</h2>
          <Link className="btn-ghost mt-4" href="/repaso">Ver repaso</Link>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card md:col-span-2">
          <p className="eyebrow">Exámenes</p>
          <ul className="mt-4 space-y-3">
            {attempts.length === 0 && <li className="text-mute">Todavía no hay resultados.</li>}
            {attempts.slice(0, 5).map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                <span>{attempt.title}</span>
                <span className="font-mono text-sm text-gold">{attempt.percent}% · {attempt.passed ? "aprobado" : "reprobado"}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <p className="eyebrow">Reconocimientos</p>
          <p className="mt-3 text-sm text-mute">{place >= 0 ? `Puesto ${place + 1} esta semana` : "Sin puesto esta semana"}</p>
          <ul className="mt-3 space-y-1 text-sm">{badges.map((badge) => <li key={badge.code}>{badge.label}</li>)}</ul>
          <ul className="mt-3 space-y-1 text-sm text-gold2">{prizes.map((prize) => <li key={prize.created_at}>{prize.title}</li>)}</ul>
          <p className="mt-4 text-xs text-mute">Un premio no es una ganancia ni se entrega de forma automática.</p>
        </article>
      </section>
      {user.experience === "advanced" && !stageUnlocked(user) && (
        <p className="text-sm text-mute">Tu ruta hacia la mesa es la validación avanzada. Elegir avanzado no la desbloquea.</p>
      )}
      {user.experience === "intermediate" && academicLevel(user) < 2 && (
        <p className="text-sm text-mute">Puedes presentar la validación del Nivel 1. Si no apruebas, las lecciones pasan a ser obligatorias.</p>
      )}
      {!premiumMembership(user) && user.role === "student" && paid && (
        <p className="text-sm text-mute">La membresía no está activa: la mesa, el repaso premium y la sala avanzada permanecen cerrados.</p>
      )}
    </div>
  );
}
