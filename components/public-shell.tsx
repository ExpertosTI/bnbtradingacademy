import Link from "next/link";
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
      <Link href="/" className="text-xl font-bold tracking-tight text-white">
        <span className="mr-2 inline-block rounded-md bg-[#3b82f6] px-2 py-0.5">B&amp;B</span>
        Academy
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
    <footer className="relative z-10 mx-auto max-w-3xl px-5 py-8 text-center text-xs leading-relaxed text-white/55">
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
