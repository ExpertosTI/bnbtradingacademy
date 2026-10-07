import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/db";

const links = [
  ["Programa", "/#programa"],
  ["Ruta", "/#niveles"],
  ["Mesa", "/#mesa"],
  ["Planes", "/planes"],
];

export function PublicHeader({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e4dfd4] bg-[#f3f0e8]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
      <Link href="/" className="text-sm font-medium tracking-tight">
        B&amp;B <span className="text-mute">Academy</span>
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
            <Link className="btn-gold" href="/registro">Apartar cupo</Link>
          </>
        )}
      </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative z-10 mx-auto mt-24 max-w-6xl border-t border-white/10 px-5 py-12 text-sm text-mute">
      <div className="flex flex-col justify-between gap-8 md:flex-row">
        <div>
          <p className="font-serif text-2xl text-cream">B&amp;B Trading Academy</p>
          <p className="mt-3 max-w-md leading-relaxed">
            Formación por niveles, exámenes y mesa en vivo. No es asesoría de inversión, no administra cuentas y no promete ganancias, fondeo ni resultados.
          </p>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link href="/legal/terminos">Términos</Link>
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/reembolsos">Cancelación</Link>
          <Link href="/legal/riesgo">Riesgo</Link>
        </div>
      </div>
    </footer>
  );
}
