"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { clearSession, setSession } from "../auth";
import { consumeReset, createReset, createUser, findUserAuth, findUserByEmail, getUser, setPassword } from "../db";
import { verifyPassword } from "../crypto";
import { safeNext } from "../format";
import { flushMail } from "../mail";

export type FormState = { error: string; notice?: string };

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = safeNext(String(formData.get("next") || "/dashboard"));
  const user = findUserAuth(email);
  if (!user || !verifyPassword(password, user.password_hash)) return { error: "Correo o contraseña incorrectos." };
  if (user.suspended) return { error: "Esta cuenta está suspendida. Escribe a la academia." };
  await setSession(user.id);
  redirect(user.role === "admin" ? "/admin" : next);
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({
    name: z.string().trim().min(2, "Escribe tu nombre."),
    email: z.string().trim().email("El correo no es válido."),
    password: z.string().min(8, "La contraseña necesita al menos 8 caracteres."),
    experience: z.enum(["beginner", "intermediate", "advanced"]),
  }).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    experience: formData.get("experience"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Revisa los datos del registro." };
  if (!formData.get("terms")) return { error: "Acepta los términos y el aviso de riesgo para crear la cuenta." };
  const { name, email, password, experience } = parsed.data;
  if (findUserByEmail(email)) return { error: "Ese correo ya tiene una cuenta." };
  const id = createUser({ email, password, name, experience });
  await setSession(id);
  redirect("/checkout");
}

export async function recoverAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const user = findUserByEmail(email);
  if (user) {
    const token = createReset(user.id);
    const link = `/restablecer?token=${token}`;
    const { queueMail } = await import("../db");
    queueMail(user.email, "Recuperar contraseña", `Abre este enlace en la academia (vence en una hora): ${link}`);
    await flushMail();
    if (process.env.NODE_ENV !== "production") {
      return { error: "", notice: `En este entorno el enlace queda visible: ${link}` };
    }
  }
  return { error: "", notice: "Si el correo existe, enviamos instrucciones para restablecer la contraseña." };
}

export async function resetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { error: "La contraseña necesita al menos 8 caracteres." };
  const userId = consumeReset(token);
  if (!userId || !getUser(userId)) return { error: "El enlace venció o ya se usó." };
  setPassword(userId, password);
  await setSession(userId);
  redirect("/dashboard");
}
