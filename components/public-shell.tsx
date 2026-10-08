import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { logoutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/db";

const links = [
  ["Planes", "/planes"],
  ["Aviso de riesgo", "/legal/riesgo"],
];

export function PublicHeader({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-30 bg-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
      <Link href="/" className="inline-flex items-center gap-3 text-white">
        <BrandMark size={46} priority />
        <span className="hidden text-sm font-semibold tracking-[0.14em] sm:inline">TRADING ACADEMY</span>
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-mute md:flex">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-cream">
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link className="btn-ghost" href={user.role === "admin" ? "/admin" : "/dashboard"}>
              Ir al campus
            </Link>
            <form action={logoutAction}>
              <button className="text-sm text-mute" type="submit">Salir</button>
            </form>
          </>
        ) : (
          <>
            <Link className="btn-ghost" href="/login">Ingresar</Link>
            <Link className="rounded-lg bg-[#4c9fff] px-4 py-2 text-sm font-bold text-white" href="/registro">EMPEZAR</Link>
          </>
        )}
      </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-5 py-10 text-center text-xs leading-relaxed text-white/55">
      <BrandMark size={72} />
      <p className="mt-4 max-w-md">
        Formación por niveles, exámenes y mesa en vivo. No es asesoría de inversión, no administra cuentas y no promete ganancias, fondeo ni resultados.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-5">
        <Link href="/legal/terminos">Términos</Link>
        <Link href="/legal/privacidad">Privacidad</Link>
        <Link href="/legal/reembolsos">Cancelación</Link>
        <Link href="/legal/riesgo">Riesgo</Link>
      </div>
    </footer>
  );
}
