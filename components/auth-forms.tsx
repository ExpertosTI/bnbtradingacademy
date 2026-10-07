"use client";

import { useActionState } from "react";
import { loginAction, recoverAction, registerAction, resetAction, type FormState } from "@/lib/actions/auth";

const initial: FormState = { error: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, initial);
  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="label">Correo</span>
        <input className="field" name="email" type="email" required />
      </label>
      <label className="block">
        <span className="label">Contraseña</span>
        <input className="field" name="password" type="password" required />
      </label>
      {state.error && <p className="text-sm text-bad">{state.error}</p>}
      <button className="btn-gold w-full" type="submit">
        Ingresar
      </button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initial);
  return (
    <form action={action} className="card space-y-4">
      <label className="block">
        <span className="label">Nombre</span>
        <input className="field" name="name" required />
      </label>
      <label className="block">
        <span className="label">Correo</span>
        <input className="field" name="email" type="email" required />
      </label>
      <label className="block">
        <span className="label">Contraseña</span>
        <input className="field" name="password" type="password" minLength={8} required />
      </label>
      <fieldset className="space-y-2">
        <legend className="label">Experiencia declarada</legend>
        <label className="flex gap-2 text-sm"><input type="radio" name="experience" value="beginner" required /> Principiante: empiezas en Nivel 1 y los videos son obligatorios.</label>
        <label className="flex gap-2 text-sm"><input type="radio" name="experience" value="intermediate" /> Intermedio: puedes validar el Nivel 1. Si apruebas, entras al Nivel 2.</label>
        <label className="flex gap-2 text-sm"><input type="radio" name="experience" value="advanced" /> Avanzado: no abre la práctica. Debes aprobar la validación avanzada.</label>
      </fieldset>
      <label className="flex gap-2 text-sm text-mute">
        <input type="checkbox" name="terms" required />
        Acepto los términos, la privacidad, la política de cancelación y el aviso de riesgo. Entiendo que la formación no garantiza ganancias.
      </label>
      {state.error && <p className="text-sm text-bad">{state.error}</p>}
      <button className="btn-gold w-full" type="submit">
        Crear cuenta y ver el pago
      </button>
    </form>
  );
}

export function RecoverForm() {
  const [state, action] = useActionState(recoverAction, initial);
  return (
    <form action={action} className="card space-y-4">
      <label className="block">
        <span className="label">Correo</span>
        <input className="field" name="email" type="email" required />
      </label>
      {state.error && <p className="text-sm text-bad">{state.error}</p>}
      {state.notice && <p className="text-sm text-good">{state.notice}</p>}
      <button className="btn-gold" type="submit">
        Enviar enlace
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetAction, initial);
  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="label">Nueva contraseña</span>
        <input className="field" name="password" type="password" minLength={8} required />
      </label>
      {state.error && <p className="text-sm text-bad">{state.error}</p>}
      <button className="btn-gold" type="submit">
        Guardar y entrar
      </button>
    </form>
  );
}
