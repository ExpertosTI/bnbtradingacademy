"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth";
import { findUserAuth, setAvatar, setPassword, updateProfile } from "../db";
import { verifyPassword } from "../crypto";

export async function saveProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  if (name.length < 2) return;
  updateProfile(user.id, name.slice(0, 80), bio.slice(0, 280));
  revalidatePath("/perfil");
  revalidatePath("/dashboard");
}

export async function changePasswordAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const auth = findUserAuth(user.email);
  if (!auth || !verifyPassword(current, auth.password_hash)) return;
  if (next.length < 8) return;
  setPassword(user.id, next);
  revalidatePath("/perfil");
}

export async function uploadAvatarAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size < 32 || file.size > 1_500_000) return;
  const bytes = Buffer.from(await file.arrayBuffer());
  const png = bytes[0] === 0x89 && bytes[1] === 0x50;
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!png && !jpg && !webp) return;
  const dir = path.join(process.cwd(), "data", "avatars");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${user.id}.img`), bytes);
  setAvatar(user.id, `/api/avatar/${user.id}?v=${Date.now()}`);
  revalidatePath("/perfil");
  revalidatePath("/dashboard");
}
