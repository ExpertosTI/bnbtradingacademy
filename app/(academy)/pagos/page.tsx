import Link from "next/link";
import { redirect } from "next/navigation";
import { cancelMembershipAction, payExamAction } from "@/lib/actions/billing";
import { getCurrentUser } from "@/lib/auth";
import { membershipGrants, membershipOf } from "@/lib/access";
import { getSettings, hasPaid, listExams, listTransactions } from "@/lib/db";
import { formatWhen, membershipLabel, money } from "@/lib/format";

export const metadata = { title: "Pagos" };

export default async function PagosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = getSettings();
  const membership = membershipOf(user);
  const txs = listTransactions(user.id);
  const exams = listExams().filter((exam) => exam.price_cents > 0 && !hasPaid(user.id, `exam:${exam.code}`));
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Cuenta</p>
        <h1 className="mt-2 font-serif text-5xl">Pagos y membresía</h1>
      </div>
      <section className="card">
        <p className="font-serif text-3xl">{membershipLabel(membership?.status)}</p>
        <p className="mt-2 text-mute">
          {membership ? `${money(membership.amount_cents, membership.currency)} · próximo cobro ${formatWhen(membership.next_charge_at, settings.timezone)}` : "Sin membresía"}
        </p>
        {!membershipGrants(membership) && user.role === "student" && <Link className="btn-gold mt-4" href="/checkout">Pagar o renovar</Link>}
        {membershipGrants(membership) && membership?.status === "active" && (
          <form action={cancelMembershipAction} className="mt-4">
            <button className="btn-danger" type="submit">Cancelar renovación</button>
          </form>
        )}
      </section>
      {exams.length > 0 && (
        <section className="card space-y-3">
          <h2 className="font-serif text-2xl">Exámenes con precio propio</h2>
          {exams.map((exam) => (
            <form key={exam.id} action={payExamAction} className="flex items-center justify-between gap-3">
              <input type="hidden" name="exam_id" value={exam.id} />
              <span>{exam.title}</span>
              <button className="btn-ghost" type="submit">{money(exam.price_cents, settings.currency)}</button>
            </form>
          ))}
        </section>
      )}
      <section className="card">
        <h2 className="font-serif text-2xl">Facturas</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {txs.length === 0 && <li className="text-mute">Aún no hay movimientos.</li>}
          {txs.map((tx) => (
            <li key={tx.id} className="flex justify-between gap-3 border-b border-white/5 py-2">
              <span>{tx.description}</span>
              <span className="font-mono">{money(tx.amount_cents, tx.currency)} · {tx.status} · {formatWhen(tx.created_at, settings.timezone)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
