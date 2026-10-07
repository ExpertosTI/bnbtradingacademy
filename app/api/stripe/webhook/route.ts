import { NextResponse } from "next/server";
import { cancelMembership, notify, setMembershipStatus } from "@/lib/db";
import { fulfillCheckoutSession, stripeClient } from "@/lib/drivers/payments";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Pasarela sin configurar" }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Firma ausente" }, { status: 400 });
  const payload = await request.text();
  const event = stripeClient().webhooks.constructEvent(payload, signature, secret);

  if (event.type === "checkout.session.completed") {
    await fulfillCheckoutSession(event.data.object.id);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as {
      metadata?: { userId?: string } | null;
      parent?: { subscription_details?: { metadata?: { userId?: string } } | null } | null;
    };
    const userId = Number(invoice.metadata?.userId || invoice.parent?.subscription_details?.metadata?.userId || 0);
    if (userId) {
      setMembershipStatus(userId, "pending");
      notify(userId, "Falló el cobro de la mensualidad", "El acceso premium queda en pago pendiente hasta regularizar la tarjeta.", `fail:${event.id}`);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const userId = Number(event.data.object.metadata?.userId || 0);
    if (userId) cancelMembership(userId);
  }

  return NextResponse.json({ received: true });
}
