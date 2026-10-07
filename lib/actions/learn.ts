"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth";
import {
  addAudit,
  addWatchSeconds,
  awardBadge,
  getAttempt,
  getExam,
  getLesson,
  getLevel,
  getSettings,
  gradeAttempt,
  notify,
  notifyStaff,
  openAttempt,
} from "../db";
import { examBlockers, isStaff, lessonGate, stageUnlocked } from "../access";
import { flushMail } from "../mail";

async function viewer() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function tickLessonAction(lessonId: number) {
  const user = await viewer();
  if (isStaff(user)) return { completed: false };
  const lesson = getLesson(lessonId);
  if (!lesson) return { completed: false };
  const level = getLevel(lesson.level_id);
  if (!level || lessonGate(user, lesson, level)) return { completed: false };
  const settings = getSettings();
  const progress = addWatchSeconds(user.id, lesson.id, 10, settings.min_watch_ratio, lesson.duration_min);
  return { completed: progress?.completed === 1, watched: progress?.watched_seconds ?? 0 };
}

export async function startExamAction(examId: number) {
  const user = await viewer();
  const exam = getExam(examId);
  if (!exam) redirect("/cursos");
  const blockers = examBlockers(user, exam);
  if (blockers.length && !isStaff(user)) redirect(`/examen/${exam.id}`);
  const attempt = openAttempt(user.id, exam);
  redirect(`/examen/${exam.id}?intento=${attempt.id}`);
}

export async function gradeExamAction(formData: FormData) {
  const user = await viewer();
  const attemptId = Number(formData.get("attempt_id"));
  const owned = getAttempt(attemptId);
  if (!owned || owned.user_id !== user.id) redirect("/cursos");
  const answers: Record<number, number> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("q-")) answers[Number(key.slice(2))] = Number(value);
  }
  const beforeStage = stageUnlocked(user);
  const result = gradeAttempt(attemptId, user.id, answers);
  if (!result) redirect(`/resultado/${attemptId}`);
  const status = result.timedOut ? "reprobado por tiempo" : result.passed ? "aprobado" : "reprobado";
  notify(
    user.id,
    result.passed ? "Examen aprobado" : "Resultado de examen",
    `${result.exam.title}: ${status}. Puntuación ${result.percent}%.`,
    `exam:${attemptId}`,
  );
  if (result.passed) {
    awardBadge(user.id, "primer-examen", "Primer examen");
    awardBadge(user.id, result.exam.code, result.exam.title);
    if (!beforeStage && stageUnlocked(user)) {
      notifyStaff("Alumno listo para la mesa", `${user.name} desbloqueó la etapa práctica.`, `practica:${user.id}`);
      awardBadge(user.id, "practica", "Etapa práctica");
    }
  }
  addAudit(user.id, "examen", `${result.exam.code} ${result.percent}`);
  await flushMail();
  revalidatePath("/dashboard");
  redirect(`/resultado/${attemptId}`);
}
