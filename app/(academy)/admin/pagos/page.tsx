import { membershipStatusAction } from "@/lib/actions/admin";
import { getSettings, listStudents, listTransactions } from "@/lib/db";
import { formatWhen, membershipLabel, money } from "@/lib/format";

export const metadata = { title: "Pagos admin" };

export default function AdminPagosPage() {
  const settings = getSettings();
  const students = listStudents();
  const txs = listTransactions();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-5xl">Pagos</h1>
      <p className="text-mute">Precio público actual: inscripción {money(settings.entry_price_cents)} y mensualidad {money(settings.monthly_price_cents)}. Cámbialos en configuración; no reescribe planes ya activos.</p>
      {students.map((student) => (
        <form key={student.id} action={membershipStatusAction} className="card flex flex-wrap items-center gap-3">
          <input type="hidden" name="user_id" value={student.id} />
          <div className="min-w-48 flex-1">
            <p>{student.name}</p>
            <p className="text-sm text-mute">{membershipLabel(student.membership_status)} {student.amount_cents ? money(student.amount_cents) : ""}</p>
          </div>
          <select className="field max-w-xs" name="status" defaultValue={student.membership_status || "pending"}>
            <option value="active">Activa</option>
            <option value="pending">Pago pendiente</option>
            <option value="expired">Vencida</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <button className="btn-ghost" type="submit">Guardar</button>
        </form>
      ))}
      <section className="card">
        <h2 className="font-serif text-2xl">Movimientos</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {txs.map((tx) => (
            <li key={tx.id}>{tx.name} · {tx.description} · {money(tx.amount_cents, tx.currency)} · {tx.status} · {formatWhen(tx.created_at, settings.timezone)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
