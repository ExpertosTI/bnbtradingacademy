import Link from "next/link";
import { OfferClock } from "@/components/offer-clock";
import { PlatformScene } from "@/components/platform-scene";
import { money } from "@/lib/format";
import { currentOffer } from "@/lib/offer";

export default function HomePage() {
  const offer = currentOffer();
  const price = money(offer.priceCents, offer.currency);
  const list = money(offer.listCents, offer.currency);

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)]">
      <PlatformScene />
      <div className="relative z-10 flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-10">
        <section className="w-full max-w-[420px] overflow-hidden rounded-[22px] border border-white/10 bg-[#0b1730] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-center bg-[#12243f] px-6 py-4">
            <p className="text-2xl font-bold tracking-tight">
              <span className="mr-2 inline-block rounded-md bg-[#3b82f6] px-2 py-0.5 text-white">B&amp;B</span>
              Academy
            </p>
          </div>
          <div className="px-6 pb-7 pt-6 text-center">
            <h1 className="text-[28px] font-bold leading-tight">Aparta tu cupo</h1>
            <p className="mx-auto mt-2 max-w-[16rem] text-[15px] leading-snug text-white/85">
              Hoy {price}. El valor del cupo es {list}.
            </p>
            <div className="mt-6">
              {offer.open ? <OfferClock target={offer.endsAt} light /> : <p className="text-sm text-white/70">La oferta de {price} ya cerró.</p>}
            </div>
            <p className="mt-5 text-sm text-white/70">
              {offer.open ? `Quedan ${offer.left} de ${offer.seats} lugares` : "Cupo de oferta cerrado"}
            </p>
            <div className="mx-auto mt-3 h-1 max-w-[240px] overflow-hidden rounded-full bg-white/10">
              <span className="block h-full bg-[#3b82f6]" style={{ width: `${Math.round((offer.taken / offer.seats) * 100)}%` }} />
            </div>
            <Link href="/registro" className="mt-6 flex h-12 items-center justify-center rounded-lg bg-[#4c9fff] text-sm font-bold tracking-wide text-white hover:bg-[#3b8df0]">
              EMPEZAR →
            </Link>
            <p className="mt-5 text-left text-[12px] leading-relaxed text-white/75">
              Al continuar aceptas los <Link className="text-[#4c9fff]" href="/legal/terminos">Términos</Link> y la <Link className="text-[#4c9fff]" href="/legal/privacidad">Política de privacidad</Link>. La membresía de {money(offer.monthlyCents, offer.currency)} cada 30 días se cobra el mismo día. Esta formación no garantiza ganancias, fondeo ni resultados. <Link className="text-[#4c9fff]" href="/legal/riesgo">Aviso de riesgo</Link>.
            </p>
            <p className="mt-4 text-sm">
              <Link className="text-white/80 underline" href="/login">¿Ya tiene una cuenta?</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
