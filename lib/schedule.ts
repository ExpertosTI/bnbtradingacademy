export type DeskWindow = {
  state: "live" | "upcoming";
  start: Date;
  end: Date;
};

function zonedParts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) map[part.type] = part.value;
  let hour = Number(map.hour);
  if (hour === 24) hour = 0;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday);
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
    weekday,
  };
}

function zonedLocalToUtc(y: number, mo: number, d: number, h: number, mi: number, timeZone: string) {
  let utc = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
  for (let i = 0; i < 2; i++) {
    const parts = zonedParts(utc, timeZone);
    const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const desired = Date.UTC(y, mo - 1, d, h, mi, 0);
    utc = new Date(utc.getTime() + (desired - asUtc));
  }
  return utc;
}

function addDays(y: number, m: number, d: number, add: number) {
  const dt = new Date(Date.UTC(y, m - 1, d + add));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

export function parseDays(value: string) {
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => n >= 0 && n <= 6);
}

export function nextWindow(now: Date, timeZone: string, days: number[], startHHMM: string, endHHMM: string): DeskWindow {
  const [sh, sm] = startHHMM.split(":").map(Number);
  const [eh, em] = endHHMM.split(":").map(Number);
  const today = zonedParts(now, timeZone);
  for (let i = 0; i < 8; i++) {
    const date = addDays(today.year, today.month, today.day, i);
    const weekday = new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay();
    if (!days.includes(weekday)) continue;
    const start = zonedLocalToUtc(date.y, date.m, date.d, sh, sm, timeZone);
    const end = zonedLocalToUtc(date.y, date.m, date.d, eh, em, timeZone);
    if (now >= start && now <= end) return { state: "live", start, end };
    if (now < start) return { state: "upcoming", start, end };
  }
  const fallback = zonedLocalToUtc(today.year, today.month, today.day, sh, sm, timeZone);
  return { state: "upcoming", start: fallback, end: new Date(fallback.getTime() + 90 * 60000) };
}
