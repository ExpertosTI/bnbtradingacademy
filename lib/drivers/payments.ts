import Stripe from "stripe";
import { activateMembership, getSettings, hasPaid, hasReference, notify } from "../db";
import { siteUrl } from "../site";

export function cardPaymentsReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function client() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Falta STRIPE_SECRET_KEY");
  return new Stripe(key);
}

export async function startCardCheckout(input: {
  userId: number;
  email: string;
  includeEntry: boolean;
  entryCents: number;
  monthlyCents: number;
}) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  if (input.includeEntry) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: input.entryCents,
        product_data: { name: "Inscripción B&B Trading Academy" },
      },
    });
  }
  lineItems.push({
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: input.monthlyCents,
      recurring: { interval: "month" },
      product_data: { name: "Membresía mensual B&B Trading Academy" },
    },
  });

  const session = await client().checkout.sessions.create({
    mode: "subscription",
    customer_email: input.email,
    client_reference_id: String(input.userId),
    success_url: `${siteUrl()}/checkout/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/checkout`,
    metadata: {
      userId: String(input.userId),
      includeEntry: input.includeEntry ? "1" : "0",
    },
    subscription_data: {
      metadata: { userId: String(input.userId) },
    },
    line_items: lineItems,
  });
  if (!session.url) throw new Error("La pasarela no devolvió la página de pago");
  return session.url;
}

export async function fulfillCheckoutSession(sessionId: string) {
  if (!cardPaymentsReady() || !sessionId) return false;
  const session = await client().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" && session.status !== "complete") return false;
  const userId = Number(session.metadata?.userId || session.client_reference_id);
  if (!userId || hasReference(session.id)) return Boolean(userId && hasReference(session.id));
  const settings = getSettings();
  const includeEntry = session.metadata?.includeEntry === "1" && !hasPaid(userId, "entry");
  const monthly = settings.monthly_price_cents;
  const end = activateMembership(userId, monthly, settings.currency, includeEntry, settings.entry_price_cents, session.id);
  notify(userId, "Pago con tarjeta registrado", `La membresía queda activa hasta ${end}.`, `stripe:${session.id}`);
  return true;
}

export function stripeClient() {
  return client();
}
