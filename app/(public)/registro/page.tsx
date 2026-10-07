import { RegisterForm } from "@/components/auth-forms";

export const metadata = { title: "Registro" };

export default function RegistroPage() {
  return (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-8 px-5 md:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="eyebrow">Cuenta</p>
        <h1 className="mt-3 font-serif text-5xl">Diagnóstico de entrada</h1>
        <p className="mt-4 text-mute">La experiencia que declares propone una ruta. No aprueba niveles ni abre la mesa.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
