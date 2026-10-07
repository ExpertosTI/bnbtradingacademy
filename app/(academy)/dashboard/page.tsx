import Link from "next/link";
import { redirect } from "next/navigation";
import { Countdown } from "@/components/countdown";
import { getCurrentUser } from "@/lib/auth";
import {
  academicLevel,
  campusProgress,
  continueLesson,
  courseAccess,
  currentLevelLabel,
  journeySteps,
  liveRequirements,
  membershipGrants,
  membershipOf,
  premiumMembership,
  stageUnlocked,
} from "@/lib/access";
import { attemptsForUser, badgesFor, getSettings, prizesForUser, weekRanking } from "@/lib/db";
import { experienceLabel, formatDay, membershipLabel, money, startOfIsoWeek } from "@/lib/format";
import { nextWindow, parseDays } from "@/lib/schedule";

export const metadata = { title: "Campus" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = getSettings();
  const membership = membershipOf(user);
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
  const steps = journeySteps(user);
  const pct = campusProgress(user);
  const next = !paid ? { href: "/checkout", label: "Completar la inscripción" } : lesson ? { href: `/leccion/${lesson.id}`, label: `Continuar: ${lesson.title}` } : { href: "/cursos", label: "Abrir la ruta" };

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Campus</p>
            <h1 className="mt-3 font-serif text-5xl md:text-6xl">Hola, {user.name.split(" ")[0]}.</h1>
            <p className="mt-3 text-mute">{experienceLabel(user.experience)} · {currentLevelLabel(user)}</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-5xl text-gold2">{pct}%</p>
            <p className="text-sm text-mute">ruta académica</p>
          </div>
        </div>
        <div className="progress-bar mt-8">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn-gold" href={next.href}>{next.label}</Link>
          <Link className="btn-ghost" href="/cursos">Ver niveles</Link>
          <Link className="btn-ghost" href="/live">Mesa en vivo</Link>
        </div>
      </section>

      <ol className="grid gap-2 md:grid-cols-5">
        {steps.map((step, index) => (
          <li key={step.id}>
            <Link href={step.href} className={`glass flex h-full flex-col justify-between p-4 ${step.done ? "border-gold/40" : ""}`}>
              <p className="font-mono text-[10px] text-gold">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-4 font-medium">{step.label}</p>
              <p className="mt-1 text-xs text-mute">{step.done ? "Completado" : "Pendiente"}</p>
            </Link>
          </li>
        ))}
      </ol>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Mesa</p>
            {live.state === "live" && <span className="inline-flex items-center gap-2 text-xs text-bad"><span className="live-dot" /> En horario</span>}
          </div>
          <h2 className="mt-3 font-serif text-3xl">{formatDay(live.start.toISOString(), settings.timezone)}</h2>
          <p className="mt-1 text-sm text-mute">{settings.live_start} – {settings.live_end}</p>
          {live.state === "upcoming" && <div className="mt-6"><Countdown target={live.start.toISOString()} label="Abre en" /></div>}
          {live.state === "live" && liveReady && <Link className="btn-gold mt-6" href="/live">Entrar al live</Link>}
          {!liveReady && user.role === "student" && (
            <ul className="mt-5 space-y-1 text-sm text-mute">{liveRequirements(user).map((item) => <li key={item}>— {item}</li>)}</ul>
          )}
        </article>
        <article className="card">
          <p className="eyebrow">Domingo</p>
          <h2 className="mt-3 font-serif text-3xl">{formatDay(review.start.toISOString(), settings.timezone)}</h2>
          <p className="mt-2 text-sm text-mute">Repaso, ranking y biblioteca de la semana.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-ghost" href="/repaso">Abrir el repaso</Link>
            <Link className="btn-ghost" href="/comunidad/general">Comunidad</Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <article className="card">
          <p className="eyebrow">Exámenes</p>
          <ul className="mt-5 space-y-3">
            {attempts.length === 0 && <li className="text-mute">Todavía no hay resultados. El examen se abre al cumplir las lecciones del nivel.</li>}
            {attempts.slice(0, 6).map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                <span>{attempt.title}</span>
                <span className={`font-mono text-sm ${attempt.passed ? "text-good" : "text-bad"}`}>{attempt.percent}% · {attempt.passed ? "aprobado" : "reprobado"}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <p className="eyebrow">Membresía</p>
          <p className="mt-3 font-serif text-3xl">{membershipLabel(membership?.status)}</p>
          <p className="mt-2 text-sm text-mute">
            {membership?.amount_cents ? `${money(membership.amount_cents, membership.currency)} · próximo cobro ${formatDay(membership.next_charge_at || "", settings.timezone)}` : "Sin plan activo"}
          </p>
          {!membershipGrants(membership) && user.role === "student" && <Link className="btn-gold mt-5" href="/checkout">Renovar</Link>}
          <p className="mt-6 text-sm text-mute">{place >= 0 ? `Puesto ${place + 1} esta semana` : "Aún no hay puesto en el ranking semanal"}</p>
          <ul className="mt-3 flex flex-wrap gap-2">{badges.map((badge) => <li key={badge.code} className="rounded-full border border-gold/30 px-3 py-1 text-xs text-gold2">{badge.label}</li>)}</ul>
          {prizes.map((prize) => <p key={prize.created_at} className="mt-2 text-sm text-gold">{prize.title}</p>)}
        </article>
      </section>

      {user.experience === "advanced" && !stageUnlocked(user) && (
        <p className="text-sm text-mute">Tu acceso a la mesa pasa por la validación avanzada. Elegir avanzado no la desbloquea.</p>
      )}
      {user.experience === "intermediate" && academicLevel(user) < 2 && (
        <p className="text-sm text-mute">Puedes validar el Nivel 1 ahora. Si no apruebas, las lecciones de ese nivel se vuelven obligatorias.</p>
      )}
      {!premiumMembership(user) && user.role === "student" && paid && (
        <p className="text-sm text-mute">La membresía no está activa: live, domingo y sala avanzada permanecen cerrados.</p>
      )}
    </div>
  );
}
