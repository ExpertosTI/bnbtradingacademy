import { OfferClock } from "@/components/offer-clock";
import { currentOffer } from "@/lib/offer";
import { money } from "@/lib/format";

export function OfferPanel() {
  const offer = currentOffer();
  const used = Math.round((offer.taken / offer.seats) * 100);
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#0b1730] p-6 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9ec5ff]">{offer.open ? "Cupo privado" : "Precio actual"}</p>
      <div className="mt-3 flex items-end gap-4">
        <p className="text-5xl font-bold leading-none">{money(offer.priceCents, offer.currency)}</p>
        <p className="mb-1 text-xl text-white/45 line-through">{money(offer.listCents, offer.currency)}</p>
      </div>
      <div className="mt-6 border-t border-white/10 pt-6">
        {offer.open ? (
          <OfferClock target={offer.endsAt} light />
        ) : (
          <p className="text-sm text-white/70">La oferta de {money(offer.offerCents, offer.currency)} ya cerró.</p>
        )}
      </div>
      <div className="mt-6">
        <div className="flex justify-between text-xs uppercase tracking-[0.16em] text-white/60">
          <span>Lugares</span>
          <span>{offer.open ? `Quedan ${offer.left} de ${offer.seats}` : offer.left === 0 ? "Agotado" : `${offer.left} libres`}</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full bg-[#4c9fff]" style={{ width: `${used}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/70">
        Hoy la inscripción es {money(offer.priceCents, offer.currency)}. La membresía de {money(offer.monthlyCents, offer.currency)} cada 30 días se cobra el mismo día.
      </p>
    </div>
  );
}
