import { OfferClock } from "@/components/offer-clock";
import { currentOffer } from "@/lib/offer";
import { money } from "@/lib/format";

export function OfferPanel() {
  const offer = currentOffer();
  const used = Math.round((offer.taken / offer.seats) * 100);
  return (
    <div className="border border-white/10 bg-black p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Valor del cupo</p>
          <p className="mt-1 font-mono text-xl text-mute line-through">{money(offer.listCents, offer.currency)}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-good">{offer.open ? "Aparta ahora" : "Precio actual"}</p>
          <p className="mt-1 font-mono text-4xl text-cream">{money(offer.priceCents, offer.currency)}</p>
        </div>
      </div>
      {offer.open ? <div className="mt-5"><OfferClock target={offer.endsAt} /></div> : <p className="mt-4 text-sm text-mute">La oferta de {money(offer.offerCents, offer.currency)} ya cerró.</p>}
      <div className="mt-5">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
          <span>Cupo</span>
          <span>{offer.open ? `Quedan ${offer.left} de ${offer.seats}` : offer.left === 0 ? "Agotado" : `${offer.left} libres`}</span>
        </div>
        <div className="progress-bar mt-2">
          <span style={{ width: `${used}%` }} />
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-mute">
        Esos {money(offer.priceCents, offer.currency)} apartan la inscripción. La membresía de {money(offer.monthlyCents, offer.currency)} cada 30 días se cobra el mismo día y queda fechada.
      </p>
    </div>
  );
}
