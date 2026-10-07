import { confirmPrizeAction } from "@/lib/actions/admin";
import { passedSince, prizesForWeek, weekRanking } from "@/lib/db";
import { startOfIsoWeek, weekKey } from "@/lib/format";

export const metadata = { title: "Ranking" };

export default function RankingPage() {
  const from = startOfIsoWeek().toISOString();
  const ranking = weekRanking(from);
  const passed = passedSince(from);
  const prizes = prizesForWeek(weekKey());
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-5xl">Semana {weekKey()}</h1>
      <p className="text-mute">El ranking sale de los exámenes aprobados. Confirmar un ganador es manual.</p>
      <ol className="card space-y-3">
        {ranking.map((row, index) => (
          <li key={row.userId} className="flex flex-wrap items-center justify-between gap-3">
            <span>{index + 1}. {row.name} · mejor {row.best}% · {row.exams} aprobados</span>
            <form action={confirmPrizeAction} className="flex gap-2">
              <input type="hidden" name="user_id" value={row.userId} />
              <input className="field" name="title" placeholder="Premio, por ejemplo reconocimiento" />
              <button className="btn-gold" type="submit">Confirmar</button>
            </form>
          </li>
        ))}
        {ranking.length === 0 && <li className="text-mute">Esta semana todavía no hay aprobados.</li>}
      </ol>
      <section className="card">
        <h2 className="font-serif text-2xl">Aprobados para el repaso del domingo</h2>
        <ul className="mt-3 space-y-1 text-sm">{passed.map((row) => <li key={`${row.user_id}-${row.finished_at}`}>{row.name} · {row.title} · {row.percent}%</li>)}</ul>
      </section>
      <section className="card">
        <h2 className="font-serif text-2xl">Premios confirmados</h2>
        <ul className="mt-3 text-sm">{prizes.map((prize) => <li key={prize.id}>{prize.name}: {prize.title}</li>)}</ul>
      </section>
    </div>
  );
}
