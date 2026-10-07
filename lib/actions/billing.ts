"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth";
import {
  activateMembership,
  addAudit,
  awardBadge,
  getExam,
  getSettings,
  hasPaid,
  notify,
  payExam,
  refreshMembership,
  setExperience,
  attemptCountForUser,
  cancelMembership,
} from "../db";
import { isStaff, membershipGrants } from "../access";
import { flushMail } from "../mail";
import { cardPaymentsReady, startCardCheckout } from "../drivers/payments";

async function student() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function confirmPaymentAction() {
  const user = await student();
  if (isStaff(user)) redirect("/dashboard");
  const settings = getSettings();
  const entryPaid = hasPaid(user.id, "entry");
  const membership = refreshMembership(user.id);
  if (entryPaid && membershipGrants(membership)) redirect("/dashboard");
  if (cardPaymentsReady()) {
    const url = await startCardCheckout({
      userId: user.id,
      email: user.email,
      includeEntry: !entryPaid,
      entryCents: settings.entry_price_cents,
      monthlyCents: entryPaid ? membership?.amount_cents || settings.monthly_price_cents : settings.monthly_price_cents,
    });
    redirect(url);
  }
  const monthly = entryPaid ? membership?.amount_cents || settings.monthly_price_cents : settings.monthly_price_cents;
  const end = activateMembership(
    user.id,
    monthly,
    settings.currency,
    !entryPaid,
    settings.entry_price_cents,
  );
  notify(
    user.id,
    "Pago registrado",
    `Tu membresía queda activa hasta ${end}. La siguiente mensualidad usa el precio fijado en tu plan.`,
    `paid:${end}`,
  );
  addAudit(user.id, "pago", `${user.email} activó membresía`);
  await flushMail();
  revalidatePath("/dashboard");
  redirect("/checkout/confirmacion");
}

export async function payExamAction(formData: FormData) {
  const user = await student();
  const exam = getExam(Number(formData.get("exam_id")));
  if (!exam || exam.price_cents <= 0) return;
  if (hasPaid(user.id, `exam:${exam.code}`)) redirect(`/examen/${exam.id}`);
  const settings = getSettings();
  payExam(user.id, exam, settings.currency);
  addAudit(user.id, "pago-examen", exam.code);
  revalidatePath("/pagos");
  redirect(`/examen/${exam.id}`);
}

export async function cancelMembershipAction() {
  const user = await student();
  cancelMembership(user.id);
  notify(user.id, "Membresía cancelada", "Conservas el acceso premium hasta el fin del periodo ya pagado.", `cancel:${user.id}:${Date.now()}`);
  addAudit(user.id, "cancelacion", user.email);
  await flushMail();
  revalidatePath("/pagos");
}

export async function saveExperienceAction(formData: FormData) {
  const user = await student();
  if (attemptCountForUser(user.id) > 0) return;
  const experience = String(formData.get("experience") || "");
  if (experience !== "beginner" && experience !== "intermediate" && experience !== "advanced") return;
  setExperience(user.id, experience);
  awardBadge(user.id, "ruta", experience === "beginner" ? "Ruta principiante" : experience === "intermediate" ? "Ruta intermedia" : "Ruta avanzada");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
