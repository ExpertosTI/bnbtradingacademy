"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth";
import { channelAllowed, isStaff } from "../access";
import { addMessage, getChannel, getUser, listStudents, notify, reportMessage, softDeleteMessage } from "../db";

async function member() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function postMessageAction(formData: FormData) {
  const user = await member();
  const slug = String(formData.get("slug") || "");
  const body = String(formData.get("body") || "").trim();
  const channel = getChannel(slug);
  if (!channel || !channelAllowed(user, channel.min_level, channel.requires_practical)) return;
  if (channel.staff_only_post && !isStaff(user)) return;
  const fresh = getUser(user.id);
  if (!fresh || fresh.suspended) return;
  if (fresh.muted_until && new Date(fresh.muted_until).getTime() > Date.now()) return;
  if (body.length < 1 || body.length > 1000) return;
  addMessage(channel.id, user.id, body);
  if (channel.slug === "anuncios") {
    for (const student of listStudents()) {
      notify(student.id, "Anuncio de la academia", body.slice(0, 180), `anuncio:${Date.now()}:${student.id}`);
    }
  }
  revalidatePath(`/comunidad/${slug}`);
}

export async function reportMessageAction(formData: FormData) {
  const user = await member();
  const id = Number(formData.get("message_id"));
  const reason = String(formData.get("reason") || "").trim();
  const slug = String(formData.get("slug") || "general");
  if (!id || reason.length < 3) return;
  reportMessage(id, user.id, reason.slice(0, 300));
  revalidatePath(`/comunidad/${slug}`);
}

export async function deleteOwnMessageAction(formData: FormData) {
  const user = await member();
  if (!isStaff(user)) return;
  softDeleteMessage(Number(formData.get("message_id")));
  revalidatePath(`/comunidad/${String(formData.get("slug") || "general")}`);
}
