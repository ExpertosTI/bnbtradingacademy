import { RecoverForm } from "@/components/auth-forms";

export const metadata = { title: "Recuperar contraseña" };

export default function RecuperarPage() {
  return (
    <div className="relative z-10 mx-auto max-w-xl px-5">
      <p className="eyebrow">Acceso</p>
      <h1 className="mt-3 font-serif text-5xl">Recuperar contraseña</h1>
      <div className="mt-8">
        <RecoverForm />
      </div>
    </div>
  );
}
