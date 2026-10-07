"use client";

import { useActionState } from "react";
import { loginAction, recoverAction, registerAction, resetAction, type FormState } from "@/lib/actions/auth";

const initial: FormState = { error: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, initial);
  return (
    <form action={action} className="card frame space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="label">Correo</span>
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="block">
        <span className="label">Contraseña</span>
        <input className="field" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error && <p className="text-sm text-bad">{state.error}</p>}
      <button className="btn-gold w-full" type="submit">Entrar al campus</button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initial);
  return (
    <form action={action} className="card frame space-y-5">
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
      <fieldset className="grid gap-2">
        <legend className="label">Elige tu ruta de entrada</legend>
        {[
          ["beginner", "Principiante", "Empiezas en Nivel 1. Los videos son obligatorios."],
          ["intermediate", "Intermedio", "Puedes validar el Nivel 1. Si no, estudias las lecciones."],
          ["advanced", "Avanzado", "Debes aprobar la validación. No abre la práctica al registrarte."],
        ].map(([value, title, copy]) => (
          <label key={value} className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 p-4 hover:border-gold/40">
            <input className="mt-1" type="radio" name="experience" value={value} required />
            <span>
              <span className="block font-medium">{title}</span>
              <span className="mt-1 block text-sm text-mute">{copy}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="flex gap-3 text-sm text-mute">
        <input type="checkbox" name="terms" required />
        Acepto términos, privacidad, cancelación y el aviso de riesgo. Esta formación no garantiza ganancias.
      </label>
      {state.error && <p className="text-sm text-bad">{state.error}</p>}
      <button className="btn-gold w-full" type="submit">Crear cuenta y ver el pago</button>
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
      <button className="btn-gold" type="submit">Enviar enlace</button>
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
      <button className="btn-gold" type="submit">Guardar y entrar</button>
    </form>
  );
}
