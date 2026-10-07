import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { fulfillCheckoutSession } from "@/lib/drivers/payments";
import { getSettings, listTransactions } from "@/lib/db";
import { formatWhen, money } from "@/lib/format";

export const metadata = { title: "Pago confirmado" };

export default async function ConfirmacionPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  if (params.session_id) await fulfillCheckoutSession(params.session_id);
  const settings = getSettings();
  const latest = listTransactions(user.id).slice(0, 2);
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Listo</p>
      <h1 className="mt-3 font-serif text-5xl">El acceso quedó registrado.</h1>
      <ul className="card mt-8 space-y-2">
        {latest.map((tx) => (
          <li key={tx.id} className="flex justify-between text-sm">
            <span>{tx.description}</span>
            <span className="font-mono">{money(tx.amount_cents, tx.currency)} · {formatWhen(tx.created_at, settings.timezone)}</span>
          </li>
        ))}
      </ul>
      <Link className="btn-gold mt-6" href="/dashboard">Ir al escritorio</Link>
    </div>
  );
}
