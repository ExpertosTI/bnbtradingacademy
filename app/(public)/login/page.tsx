import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { safeNext } from "@/lib/format";

export const metadata = { title: "Ingresar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-2 md:items-center">
      <div>
        <p className="eyebrow">Campus</p>
        <h1 className="mt-3 font-serif text-6xl leading-[0.92] md:text-7xl">Entra a tu escritorio.</h1>
        <p className="mt-4 text-mute">
          <Link className="text-gold" href="/recuperar">Olvidé mi contraseña</Link>
          {" · "}
          <Link className="text-gold" href="/registro">Crear cuenta</Link>
        </p>
      </div>
      <LoginForm next={safeNext(params.next)} />
    </div>
  );
}
