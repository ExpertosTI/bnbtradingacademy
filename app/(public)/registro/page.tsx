import { RegisterForm } from "@/components/auth-forms";

export const metadata = { title: "Registro" };

export default function RegistroPage() {
  return (
    <div className="relative z-10 mx-auto grid max-w-5xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <div>
        <p className="eyebrow">Diagnóstico</p>
        <h1 className="mt-3 font-serif text-5xl">Elige cómo entras. El sistema decide qué se abre.</h1>
        <p className="mt-4 leading-relaxed text-mute">
          La experiencia que declares propone una ruta. No aprueba exámenes, no omite pagos y no entrega la mesa.
        </p>
        <ol className="mt-8 space-y-4 text-sm text-mute">
          <li>01 · Cuenta y términos</li>
          <li>02 · Pago visible, con la próxima mensualidad fechada</li>
          <li>03 · Lecciones, examen, desbloqueo</li>
          <li>04 · Mesa y domingo cuando cumplas</li>
        </ol>
      </div>
      <RegisterForm />
    </div>
  );
}
