import { ResetForm } from "@/components/auth-forms";

export const metadata = { title: "Nueva contraseña" };

export default async function RestablecerPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return (
    <div className="relative z-10 mx-auto max-w-xl px-5">
      <h1 className="font-serif text-5xl">Nueva contraseña</h1>
      <div className="mt-8">
        {params.token ? <ResetForm token={params.token} /> : <p className="text-mute">Falta el enlace de recuperación.</p>}
      </div>
    </div>
  );
}
