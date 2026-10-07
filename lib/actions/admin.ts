"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth";
import {
  addAudit,
  addQuestion,
  confirmPrize,
  deleteBroadcast,
  deleteLesson,
  deleteQuestion,
  getUser,
  notify,
  resolveReport,
  saveBroadcast,
  saveExam,
  saveLesson,
  setMembershipStatus,
  setMuted,
  setSuspended,
  softDeleteMessage,
  updateLevel,
  updateProfile,
  updateQuestion,
  updateSettings,
} from "../db";
import { weekKey } from "../format";

async function admin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");
  return user;
}

async function staff() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) redirect("/dashboard");
  return user;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function saveSettingsAction(formData: FormData) {
  const user = await admin();
  const entry = Math.round(Number(formData.get("entry_price")) * 100);
  const list = Math.round(Number(formData.get("list_price")) * 100);
  const monthly = Math.round(Number(formData.get("monthly_price")) * 100);
  const seats = Math.round(Number(formData.get("offer_seats")));
  const ratio = Number(formData.get("min_watch_ratio"));
  if (!Number.isFinite(entry) || entry < 0 || !Number.isFinite(list) || list < 0 || !Number.isFinite(monthly) || monthly < 0) return;
  const rawEnd = text(formData, "offer_ends_at");
  const normalized = rawEnd.length === 16 ? `${rawEnd}:00` : rawEnd;
  const ends = new Date(normalized.endsWith("Z") || /[+-]\d\d:\d\d$/.test(normalized) ? normalized : `${normalized}-04:00`);
  updateSettings({
    academy_name: text(formData, "academy_name") || "B&B Trading Academy",
    entry_price_cents: String(entry),
    list_price_cents: String(list),
    offer_seats: String(Number.isFinite(seats) && seats > 0 ? seats : 50),
    offer_ends_at: Number.isNaN(ends.getTime()) ? "2026-10-12T03:59:59.000Z" : ends.toISOString(),
    monthly_price_cents: String(monthly),
    timezone: text(formData, "timezone") || "America/Santo_Domingo",
    live_start: text(formData, "live_start") || "09:00",
    live_end: text(formData, "live_end") || "10:30",
    live_days: text(formData, "live_days") || "1,2,3,4,5",
    live_stream_url: text(formData, "live_stream_url"),
    review_start: text(formData, "review_start") || "19:00",
    review_end: text(formData, "review_end") || "20:30",
    review_stream_url: text(formData, "review_stream_url"),
    min_watch_ratio: String(Number.isFinite(ratio) ? Math.min(1, Math.max(0.1, ratio)) : 0.8),
    expire_locks: text(formData, "expire_locks") === "all" ? "all" : "premium",
  });
  addAudit(user.id, "config", "Precios, horarios o reglas actualizados");
  revalidatePath("/", "layout");
  revalidatePath("/admin/config");
}

export async function saveLevelAction(formData: FormData) {
  await admin();
  updateLevel(Number(formData.get("id")), text(formData, "name"), text(formData, "summary"));
  revalidatePath("/admin/contenido");
}

export async function saveLessonAction(formData: FormData) {
  const user = await staff();
  const id = Number(formData.get("id") || 0);
  saveLesson({
    id: id || undefined,
    level_id: Number(formData.get("level_id")),
    title: text(formData, "title"),
    summary: text(formData, "summary"),
    duration_min: Math.max(1, Number(formData.get("duration_min") || 1)),
    video_ref: text(formData, "video_ref"),
  });
  addAudit(user.id, "contenido", text(formData, "title"));
  revalidatePath("/admin/contenido");
  revalidatePath("/cursos");
}

export async function deleteLessonAction(formData: FormData) {
  const user = await admin();
  deleteLesson(Number(formData.get("id")));
  addAudit(user.id, "contenido", `Lección ${formData.get("id")} eliminada`);
  revalidatePath("/admin/contenido");
}

export async function saveExamAction(formData: FormData) {
  const user = await admin();
  saveExam(
    Number(formData.get("id")),
    Math.min(100, Math.max(1, Number(formData.get("min_score") || 70))),
    Math.max(0, Number(formData.get("cooldown_hours") || 0)),
    Math.max(5, Number(formData.get("time_limit_min") || 20)),
    Math.max(0, Math.round(Number(formData.get("price") || 0) * 100)),
    text(formData, "title"),
  );
  addAudit(user.id, "examen", `Examen ${formData.get("id")} actualizado`);
  revalidatePath("/admin/examenes");
}

export async function addQuestionAction(formData: FormData) {
  await admin();
  const labels = [1, 2, 3, 4].map((n) => text(formData, `option_${n}`)).filter(Boolean);
  if (labels.length < 2) return;
  addQuestion(
    Number(formData.get("exam_id")),
    text(formData, "prompt"),
    text(formData, "kind") === "tf" ? "tf" : "mc",
    Math.max(1, Number(formData.get("points") || 20)),
    labels,
    Math.max(0, Number(formData.get("correct") || 1) - 1),
  );
  revalidatePath("/admin/examenes");
}

export async function updateQuestionAction(formData: FormData) {
  await admin();
  const labels = [1, 2, 3, 4].map((n) => text(formData, `option_${n}`)).filter(Boolean);
  if (labels.length < 2) return;
  updateQuestion(
    Number(formData.get("id")),
    text(formData, "prompt"),
    Math.max(1, Number(formData.get("points") || 20)),
    labels,
    Math.max(0, Number(formData.get("correct") || 1) - 1),
  );
  revalidatePath("/admin/examenes");
}

export async function deleteQuestionAction(formData: FormData) {
  await admin();
  deleteQuestion(Number(formData.get("id")));
  revalidatePath("/admin/examenes");
}

export async function membershipStatusAction(formData: FormData) {
  const user = await admin();
  const studentId = Number(formData.get("user_id"));
  const status = text(formData, "status");
  if (status !== "active" && status !== "expired" && status !== "cancelled" && status !== "pending") return;
  setMembershipStatus(studentId, status);
  const student = getUser(studentId);
  if (student) notify(student.id, "Estado de membresía", `Administración marcó tu membresía como ${status}.`, `status:${studentId}:${Date.now()}`);
  addAudit(user.id, "membresia", `${studentId} → ${status}`);
  revalidatePath("/admin/pagos");
}

export async function moderateUserAction(formData: FormData) {
  const user = await admin();
  const studentId = Number(formData.get("user_id"));
  const action = text(formData, "action");
  if (action === "suspend") setSuspended(studentId, 1);
  if (action === "restore") setSuspended(studentId, 0);
  if (action === "mute") setMuted(studentId, new Date(Date.now() + 24 * 3600 * 1000).toISOString());
  if (action === "unmute") setMuted(studentId, null);
  addAudit(user.id, "moderacion", `${action} usuario ${studentId}`);
  revalidatePath("/admin/comunidad");
}

export async function adminDeleteMessageAction(formData: FormData) {
  const user = await staff();
  softDeleteMessage(Number(formData.get("message_id")));
  addAudit(user.id, "chat", `Mensaje ${formData.get("message_id")} eliminado`);
  revalidatePath("/admin/comunidad");
}

export async function resolveReportAction(formData: FormData) {
  await staff();
  resolveReport(Number(formData.get("id")));
  revalidatePath("/admin/comunidad");
}

export async function saveBroadcastAction(formData: FormData) {
  const user = await staff();
  const id = Number(formData.get("id") || 0);
  saveBroadcast({
    id: id || undefined,
    kind: text(formData, "kind") === "review" ? "review" : "live",
    title: text(formData, "title"),
    starts_at: new Date(text(formData, "starts_at")).toISOString(),
    ends_at: new Date(text(formData, "ends_at")).toISOString(),
    stream_url: text(formData, "stream_url"),
    recording_url: text(formData, "recording_url"),
  });
  addAudit(user.id, "live", text(formData, "title"));
  revalidatePath("/admin/lives");
  revalidatePath("/repaso");
}

export async function deleteBroadcastAction(formData: FormData) {
  const user = await admin();
  deleteBroadcast(Number(formData.get("id")));
  addAudit(user.id, "live", `Emisión ${formData.get("id")} eliminada`);
  revalidatePath("/admin/lives");
}

export async function confirmPrizeAction(formData: FormData) {
  const user = await admin();
  const studentId = Number(formData.get("user_id"));
  const title = text(formData, "title") || "Reconocimiento de la semana";
  confirmPrize(weekKey(), studentId, title, user.id);
  const student = getUser(studentId);
  if (student) {
    notify(student.id, "Reconocimiento confirmado", `${title}. No es un resultado de trading ni una garantía de ganancia.`, `premio:${weekKey()}:${studentId}`);
  }
  addAudit(user.id, "premio", `${title} → ${studentId}`);
  revalidatePath("/admin/ranking");
}

export async function saveTeacherNoteAction(formData: FormData) {
  const user = await staff();
  updateProfile(user.id, text(formData, "name") || user.name, text(formData, "bio"));
  revalidatePath("/profesor");
}

export async function publishStreamAction(formData: FormData) {
  const user = await staff();
  updateSettings({
    live_stream_url: text(formData, "live_stream_url"),
    review_stream_url: text(formData, "review_stream_url"),
  });
  addAudit(user.id, "live", "Enlaces de transmisión actualizados");
  revalidatePath("/live");
  revalidatePath("/repaso");
}
