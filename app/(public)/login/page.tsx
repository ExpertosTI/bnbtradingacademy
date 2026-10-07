import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { safeNext } from "@/lib/format";

export const metadata = { title: "Ingresar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-8 px-5 md:grid-cols-2">
      <div>
        <p className="eyebrow">Sesión</p>
        <h1 className="mt-3 font-serif text-5xl">Ingresar</h1>
        <p className="mt-4 text-mute">
          <Link className="text-gold" href="/recuperar">Olvidé mi contraseña</Link>
        </p>
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-8 space-y-2 font-mono text-xs text-mute">
            <p>admin@bbtrading.academy · BbAdmin2026!</p>
            <p>analisis@bbtrading.academy · BbProfe2026!</p>
            <p>alumno@bbtrading.academy · BbAlumno2026!</p>
          </div>
        )}
      </div>
      <LoginForm next={safeNext(params.next)} />
    </div>
  );
}
