"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, CreditCard, GraduationCap, LayoutDashboard, LogOut, MessagesSquare, Radio, Shield, SunMedium, UserRound } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/db";

const studentLinks = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/live", label: "En vivo", icon: Radio },
  { href: "/repaso", label: "Domingo", icon: SunMedium },
  { href: "/comunidad", label: "Comunidad", icon: MessagesSquare },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

export function AppShell({ user, unread, children }: { user: User; unread: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const links = [...studentLinks];
  if (user.role === "teacher" || user.role === "admin") links.push({ href: "/profesor", label: "Profesor", icon: GraduationCap });
  if (user.role === "admin") links.push({ href: "/admin", label: "Admin", icon: Shield });

  return (
    <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 py-5 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard" className="font-serif text-2xl">
          B&amp;B <span className="italic text-gold">Academy</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/notificaciones" className="inline-flex items-center gap-1 text-mute">
            <Bell size={16} />
            Avisos{unread > 0 ? ` (${unread})` : ""}
          </Link>
          <span className="text-cream">{user.name}</span>
          <form action={logoutAction}>
            <button className="inline-flex items-center gap-1 text-mute" type="submit">
              <LogOut size={16} /> Salir
            </button>
          </form>
        </div>
      </header>
      <nav className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link key={link.href} href={link.href} data-active={active} className="nav-link inline-flex items-center gap-1.5">
              <Icon size={15} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <main className="py-6">{children}</main>
    </div>
  );
}
