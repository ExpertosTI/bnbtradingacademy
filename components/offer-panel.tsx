import { OfferClock } from "@/components/offer-clock";
import { currentOffer } from "@/lib/offer";
import { money } from "@/lib/format";

export function OfferPanel() {
  const offer = currentOffer();
  const used = Math.round((offer.taken / offer.seats) * 100);
  return (
    <div className="rounded-2xl bg-[#1f4b3a] p-6 text-[#f7f4ee]">
      <p className="text-sm text-[#d5e5dc]">{offer.open ? "Precio para apartar ahora" : "Precio actual"}</p>
      <div className="mt-2 flex items-end gap-3">
        <p className="text-5xl font-semibold tracking-tight">{money(offer.priceCents, offer.currency)}</p>
        <p className="mb-1 text-lg text-[#d5e5dc] line-through">{money(offer.listCents, offer.currency)}</p>
      </div>
      <div className="mt-5">
        {offer.open ? <OfferClock target={offer.endsAt} /> : <p className="text-sm text-[#d5e5dc]">La oferta de {money(offer.offerCents, offer.currency)} ya cerró.</p>}
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-sm text-[#d5e5dc]">
          <span>Lugares</span>
          <span>{offer.open ? `Quedan ${offer.left} de ${offer.seats}` : offer.left === 0 ? "Agotado" : `${offer.left} libres`}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
          <span className="block h-full rounded-full bg-[#f3f0e8]" style={{ width: `${used}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#d5e5dc]">
        La inscripción de hoy es {money(offer.priceCents, offer.currency)}. La membresía de {money(offer.monthlyCents, offer.currency)} cada 30 días se cobra el mismo día.
      </p>
    </div>
  );
}
