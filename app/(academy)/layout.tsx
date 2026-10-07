import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { campusProgress, currentLevelLabel } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { ensureReminders } from "@/lib/automation";
import { unreadCount } from "@/lib/db";

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  ensureReminders(user.id);
  return (
    <AppShell user={user} unread={unreadCount(user.id)} progress={campusProgress(user)} levelLabel={currentLevelLabel(user)}>
      {children}
    </AppShell>
  );
}
