import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listNotifications, markAllRead } from "@/lib/db";
import { getSettings } from "@/lib/db";
import { formatWhen } from "@/lib/format";

export const metadata = { title: "Avisos" };

export default async function NotificacionesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = getSettings();
  const items = listNotifications(user.id);
  markAllRead(user.id);
  return (
    <div>
      <h1 className="font-serif text-5xl">Avisos</h1>
      <ul className="mt-6 space-y-3">
        {items.length === 0 && <li className="text-mute">No hay avisos.</li>}
        {items.map((item) => (
          <li key={item.id} className="card">
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-sm text-mute">{item.body}</p>
            <p className="mt-2 font-mono text-xs text-gold">{formatWhen(item.created_at, settings.timezone)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
