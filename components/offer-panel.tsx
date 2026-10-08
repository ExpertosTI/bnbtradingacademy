import { OfferClock } from "@/components/offer-clock";
import { currentOffer } from "@/lib/offer";
import { money } from "@/lib/format";

export function OfferPanel() {
  const offer = currentOffer();
  const used = Math.round((offer.taken / offer.seats) * 100);
  return (
    <div className="rounded-2xl border border-gold/30 bg-[#100e0c] p-6">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">{offer.open ? "Cupo privado" : "Precio actual"}</p>
      <div className="mt-3 flex items-end gap-4">
        <p className="font-serif text-6xl leading-none text-cream">{money(offer.priceCents, offer.currency)}</p>
        <p className="mb-1 font-serif text-2xl text-mute line-through">{money(offer.listCents, offer.currency)}</p>
      </div>
      <div className="mt-6 border-t border-gold/20 pt-6">
        {offer.open ? (
          <OfferClock target={offer.endsAt} />
        ) : (
          <p className="text-sm text-mute">La oferta de {money(offer.offerCents, offer.currency)} ya cerró.</p>
        )}
      </div>
      <div className="mt-6">
        <div className="flex justify-between text-xs uppercase tracking-[0.16em] text-mute">
          <span>Lugares</span>
          <span className="text-gold2">{offer.open ? `Quedan ${offer.left} de ${offer.seats}` : offer.left === 0 ? "Agotado" : `${offer.left} libres`}</span>
        </div>
        <div className="progress-bar mt-3">
          <span style={{ width: `${used}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        Hoy la inscripción es {money(offer.priceCents, offer.currency)}. La membresía de {money(offer.monthlyCents, offer.currency)} cada 30 días se cobra el mismo día.
      </p>
    </div>
  );
}
