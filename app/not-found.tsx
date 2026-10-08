import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <div className="relative z-10 mx-auto max-w-xl px-5 py-24">
      <BrandMark size={96} />
      <p className="eyebrow mt-6">404</p>
      <h1 className="mt-3 font-serif text-5xl">Esa página no está en la academia.</h1>
      <Link className="btn-gold mt-6" href="/">Volver al inicio</Link>
    </div>
  );
}
