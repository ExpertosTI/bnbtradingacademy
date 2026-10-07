import { courseAccess, premiumMembership } from "./access";
import { getSettings, getUser, hasKind, notify } from "./db";
import { nextWindow, parseDays } from "./schedule";

export function ensureReminders(userId: number) {
  const user = getUser(userId);
  if (!user || user.role !== "student" || !courseAccess(user)) return;
  const settings = getSettings();
  const now = new Date();
  const live = nextWindow(now, settings.timezone, parseDays(settings.live_days), settings.live_start, settings.live_end);
  const review = nextWindow(now, settings.timezone, [0], settings.review_start, settings.review_end);
  remind(user.id, "live", live, premiumMembership(user));
  remind(user.id, "review", review, premiumMembership(user));
}

function remind(userId: number, kind: "live" | "review", window: { state: "live" | "upcoming"; start: Date }, allowed: boolean) {
  const hours = (window.start.getTime() - Date.now()) / 36e5;
  const soon = window.state === "live" || (hours >= 0 && hours <= 2);
  if (!soon) return;
  const key = `${kind}:${window.start.toISOString().slice(0, 13)}`;
  if (hasKind(userId, key)) return;
  const title = kind === "live" ? "Trading en vivo" : "Repaso del domingo";
  const body = allowed
    ? "La sesión está por abrir. Entra desde tu panel, sin pedir el enlace por fuera."
    : "Hay sesión en el calendario. Tu acceso premium sigue cerrado hasta cumplir nivel y membresía.";
  notify(userId, title, body, key);
}
