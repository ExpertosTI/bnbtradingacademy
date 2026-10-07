import { redirect } from "next/navigation";
import { confirmPaymentAction } from "@/lib/actions/billing";
import { getCurrentUser } from "@/lib/auth";
import { courseAccess, membershipGrants, membershipOf } from "@/lib/access";
import { cardPaymentsReady } from "@/lib/drivers/payments";
import { getSettings, hasPaid } from "@/lib/db";
import { formatDay, money } from "@/lib/format";

export const metadata = { title: "Pago" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = getSettings();
  const entryPaid = hasPaid(user.id, "entry");
  const membership = membershipOf(user);
  const active = membershipGrants(membership);
  if (user.role !== "student") redirect("/dashboard");
  if (entryPaid && active) redirect("/dashboard");

  const lines = [
    ...(!entryPaid ? [{ name: "Inscripción", amount: settings.entry_price_cents }] : []),
    { name: entryPaid ? "Renovación mensual" : "Primer mes de membresía", amount: entryPaid ? membership?.amount_cents || settings.monthly_price_cents : settings.monthly_price_cents },
  ];
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const next = new Date(Date.now() + 30 * 86400000).toISOString();
  const nextAmount = entryPaid ? membership?.amount_cents || settings.monthly_price_cents : settings.monthly_price_cents;

  const card = cardPaymentsReady();
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-3 font-serif text-5xl">Esto es lo que pagas hoy.</h1>
      <div className="card mt-8 space-y-3">
        {lines.map((line) => (
          <div key={line.name} className="flex justify-between">
            <span>{line.name}</span>
            <span className="font-mono">{money(line.amount, settings.currency)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-white/10 pt-3 font-serif text-2xl">
          <span>Total de hoy</span>
          <span>{money(total, settings.currency)}</span>
        </div>
        <p className="text-sm text-mute">
          La siguiente mensualidad de {money(nextAmount, settings.currency)} queda para el {formatDay(next, settings.timezone)}. Ese monto queda guardado en tu plan aunque el precio público cambie.
        </p>
      </div>
      <form action={confirmPaymentAction} className="mt-6 space-y-3">
        <button className="btn-gold" type="submit">{card ? "Pagar con tarjeta" : "Registrar pago y abrir el acceso"}</button>
        <p className="text-sm text-mute">
          {card
            ? "El cobro recurrente sale por Stripe hacia bnbtradingacademy.com. La membresía se activa al confirmarse el pago."
            : "Sin llaves de Stripe, este paso registra la factura y abre el acceso. En el servidor, STRIPE_SECRET_KEY cambia el botón a cobro con tarjeta sin tocar el resto de la academia."}
        </p>
      </form>
      {!courseAccess(user) && <p className="mt-4 text-sm text-mute">Sin este paso las lecciones permanecen cerradas.</p>}
    </div>
  );
}
