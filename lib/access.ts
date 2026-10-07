import type { Exam, Lesson, Level, Membership, User } from "./db";
import {
  allProgress,
  failedCount,
  getExamByCode,
  getMembership,
  getSettings,
  hasPaid,
  hasPassed,
  lastGraded,
  listLessons,
  listLevels,
  refreshMembership,
} from "./db";

export function isStaff(user: User) {
  return user.role === "admin" || user.role === "teacher";
}

export function membershipGrants(membership: Membership | null) {
  if (!membership) return false;
  if (membership.status === "active") return true;
  if (membership.status === "cancelled" && membership.current_period_end && new Date(membership.current_period_end).getTime() > Date.now()) {
    return true;
  }
  return false;
}

export function courseAccess(user: User) {
  if (isStaff(user)) return true;
  const settings = getSettings();
  const entry = hasPaid(user.id, "entry");
  const membership = refreshMembership(user.id);
  if (!entry) return false;
  if (settings.expire_locks === "all" && !membershipGrants(membership)) return false;
  return true;
}

export function premiumMembership(user: User) {
  if (isStaff(user)) return true;
  return hasPaid(user.id, "entry") && membershipGrants(refreshMembership(user.id));
}

export function lessonsDone(userId: number, levelId: number) {
  const lessons = listLessons(levelId);
  if (lessons.length === 0) return true;
  const progress = allProgress(userId);
  return lessons.every((lesson) => progress.some((item) => item.lesson_id === lesson.id && item.completed === 1));
}

export function academicLevel(user: User) {
  if (hasPassed(user.id, "nivel-2")) return 3;
  if (hasPassed(user.id, "nivel-1")) return 2;
  return 1;
}

export function stageUnlocked(user: User) {
  if (isStaff(user)) return true;
  if (user.experience === "advanced") return hasPassed(user.id, "validacion-avanzada");
  return hasPassed(user.id, "nivel-3");
}

export function levelUnlocked(user: User, level: Level) {
  if (isStaff(user)) return true;
  if (!courseAccess(user)) return false;
  if (level.practical === 1) return stageUnlocked(user);
  if (level.sort_order <= 1) return true;
  if (level.sort_order === 2) return hasPassed(user.id, "nivel-1");
  if (level.sort_order === 3) return hasPassed(user.id, "nivel-2");
  return false;
}

export function lessonGate(user: User, lesson: Lesson, level: Level) {
  if (!courseAccess(user)) return "Primero completa la inscripción y la membresía.";
  if (!levelUnlocked(user, level)) return "Este nivel sigue cerrado. Aprueba el examen anterior para abrirlo.";
  return null;
}

export function examBlockers(user: User, exam: Exam) {
  const reasons: string[] = [];
  if (!isStaff(user) && !courseAccess(user)) reasons.push("Necesitas la inscripción activa para presentar exámenes.");
  if (exam.code === "validacion-avanzada" && user.experience !== "advanced" && !isStaff(user)) {
    reasons.push("Esta validación es la ruta de quienes se registran como avanzados.");
  }
  if (exam.price_cents > 0 && !hasPaid(user.id, `exam:${exam.code}`) && !isStaff(user)) {
    reasons.push("Este examen tiene un pago propio. Regístralo en Pagos antes de empezar.");
  }
  const level = listLevels().find((item) => item.id === exam.level_id);
  if (level && !levelUnlocked(user, level) && !isStaff(user)) {
    reasons.push("El nivel de este examen todavía no está desbloqueado.");
  }
  if (!isStaff(user) && exam.code === "nivel-1" && user.experience === "beginner" && level && !lessonsDone(user.id, level.id)) {
    reasons.push("Completa los tres videos del Nivel 1. El examen se abre al terminarlos.");
  }
  if (!isStaff(user) && exam.code === "nivel-1" && user.experience === "advanced" && level && !lessonsDone(user.id, level.id)) {
    reasons.push("Si presentas el Nivel 1, primero completa sus lecciones. Tu ruta hacia la práctica es la validación avanzada.");
  }
  if (!isStaff(user) && exam.code === "nivel-1" && user.experience === "intermediate" && failedCount(user.id, exam.id) > 0 && level && !lessonsDone(user.id, level.id)) {
    reasons.push("La validación no se aprobó. Completa las lecciones del Nivel 1 antes de repetir.");
  }
  if (!isStaff(user) && (exam.code === "nivel-2" || exam.code === "nivel-3") && level && !lessonsDone(user.id, level.id)) {
    reasons.push("Completa las lecciones de este nivel para habilitar el examen.");
  }
  const previous = lastGraded(user.id, exam.id);
  if (previous && exam.cooldown_hours > 0 && previous.passed === 0) {
    const readyAt = new Date(previous.finished_at || previous.started_at).getTime() + exam.cooldown_hours * 3600 * 1000;
    if (Date.now() < readyAt) reasons.push(`Puedes repetir este examen después del tiempo de espera definido por la academia.`);
  }
  return reasons;
}

export function liveRequirements(user: User) {
  const missing: string[] = [];
  if (!premiumMembership(user)) missing.push("Membresía activa");
  if (!stageUnlocked(user)) {
    missing.push(user.experience === "advanced" ? "Aprobar la validación avanzada" : "Aprobar la evaluación del Nivel 3");
  }
  return missing;
}

export function channelAllowed(user: User, minLevel: number, practical: number) {
  if (isStaff(user)) return true;
  if (!courseAccess(user)) return false;
  if (practical === 1) return stageUnlocked(user) && premiumMembership(user);
  return academicLevel(user) >= minLevel;
}

export function currentLevelLabel(user: User) {
  const levels = listLevels();
  if (stageUnlocked(user)) return levels.find((level) => level.practical === 1)?.name || "Etapa práctica";
  const order = academicLevel(user);
  return levels.find((level) => level.sort_order === order)?.name || "Nivel 1";
}

export function continueLesson(user: User) {
  const levels = listLevels().filter((level) => level.practical === 0 && levelUnlocked(user, level));
  const progress = allProgress(user.id);
  for (const level of levels) {
    for (const lesson of listLessons(level.id)) {
      const done = progress.some((item) => item.lesson_id === lesson.id && item.completed === 1);
      if (!done) return lesson;
    }
  }
  return null;
}

export function levelProgress(user: User, level: Level) {
  const lessons = listLessons(level.id);
  if (lessons.length === 0) return 0;
  const progress = allProgress(user.id);
  const done = lessons.filter((lesson) => progress.some((item) => item.lesson_id === lesson.id && item.completed === 1)).length;
  return Math.round((done / lessons.length) * 100);
}

export function examForLevel(level: Level) {
  if (level.code === "nivel-1") return getExamByCode("nivel-1");
  if (level.code === "nivel-2") return getExamByCode("nivel-2");
  if (level.code === "nivel-3") return getExamByCode("nivel-3");
  return undefined;
}

export function membershipOf(user: User) {
  return refreshMembership(user.id);
}

export function campusProgress(user: User) {
  const levels = listLevels().filter((level) => level.practical === 0);
  const progress = allProgress(user.id);
  let total = 0;
  let done = 0;
  for (const level of levels) {
    const lessons = listLessons(level.id);
    total += lessons.length;
    done += lessons.filter((lesson) => progress.some((item) => item.lesson_id === lesson.id && item.completed === 1)).length;
  }
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function journeySteps(user: User) {
  const paid = courseAccess(user);
  const n1 = hasPassed(user.id, "nivel-1");
  const n2 = hasPassed(user.id, "nivel-2");
  const n3 = stageUnlocked(user);
  const live = liveRequirements(user).length === 0;
  return [
    { id: "pago", label: "Inscripción", done: paid, href: paid ? "/dashboard" : "/checkout" },
    { id: "n1", label: "Nivel 1", done: n1, href: "/cursos" },
    { id: "n2", label: "Nivel 2", done: n2, href: "/cursos" },
    { id: "n3", label: "Nivel 3", done: n3, href: "/cursos" },
    { id: "mesa", label: "Mesa en vivo", done: live, href: "/live" },
  ];
}
