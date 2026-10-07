import { getSettings, reservedSeats, type Settings } from "./db";

export type Offer = {
  open: boolean;
  priceCents: number;
  offerCents: number;
  listCents: number;
  seats: number;
  taken: number;
  left: number;
  endsAt: string;
  monthlyCents: number;
  currency: string;
};

export function offerFrom(settings: Settings, taken: number, now = Date.now()): Offer {
  const seats = Math.max(1, settings.offer_seats || 1);
  const left = Math.max(0, seats - taken);
  const ends = new Date(settings.offer_ends_at).getTime();
  const open = Number.isFinite(ends) && now < ends && left > 0;
  return {
    open,
    priceCents: open ? settings.entry_price_cents : settings.list_price_cents,
    offerCents: settings.entry_price_cents,
    listCents: settings.list_price_cents,
    seats,
    taken: Math.min(seats, taken),
    left,
    endsAt: settings.offer_ends_at,
    monthlyCents: settings.monthly_price_cents,
    currency: settings.currency,
  };
}

export function currentOffer() {
  return offerFrom(getSettings(), reservedSeats());
}
