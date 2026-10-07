import { cookies } from "next/headers";
import { createSession, deleteSession, userBySession } from "./db";

const COOKIE = "bb_session";

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return userBySession(token) ?? null;
}

export async function setSession(userId: number) {
  const token = createSession(userId);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) deleteSession(token);
  jar.delete(COOKIE);
}
