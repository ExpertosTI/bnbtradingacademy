export function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function formatWhen(iso: string | null | undefined, timeZone: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatDay(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("es-DO", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function experienceLabel(value: string | null) {
  if (value === "beginner") return "Principiante";
  if (value === "intermediate") return "Intermedio";
  if (value === "advanced") return "Avanzado";
  return "Sin definir";
}

export function membershipLabel(status: string | null | undefined) {
  if (status === "active") return "Activa";
  if (status === "expired") return "Vencida";
  if (status === "cancelled") return "Cancelada";
  if (status === "pending") return "Pago pendiente";
  return "Sin membresía";
}

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export function weekKey(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function startOfIsoWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}
