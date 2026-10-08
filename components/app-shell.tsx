"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, CreditCard, GraduationCap, LayoutDashboard, LogOut, MessagesSquare, Radio, Shield, SunMedium, UserRound } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/db";

const studentLinks = [
  { href: "/dashboard", label: "Campus", icon: LayoutDashboard },
  { href: "/cursos", label: "Ruta", icon: BookOpen },
  { href: "/live", label: "Mesa", icon: Radio },
  { href: "/repaso", label: "Domingo", icon: SunMedium },
  { href: "/comunidad", label: "Comunidad", icon: MessagesSquare },
  { href: "/pagos", label: "Membresía", icon: CreditCard },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

export function AppShell({
  user,
  unread,
  progress,
  levelLabel,
  children,
}: {
  user: User;
  unread: number;
  progress: number;
  levelLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const links = [...studentLinks];
  if (user.role === "teacher" || user.role === "admin") links.push({ href: "/profesor", label: "Profesor", icon: GraduationCap });
  if (user.role === "admin") links.push({ href: "/admin", label: "Admin", icon: Shield });

  return (
    <div className="relative z-10 mx-auto min-h-screen max-w-[1440px] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-gold/15 bg-[#100e0c] px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <Link href="/dashboard" className="px-2 font-serif text-2xl text-cream">
          B&amp;B <span className="italic text-gold">Academy</span>
        </Link>
        <div className="mt-8 px-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{levelLabel}</p>
          <div className="progress-bar mt-2">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-gold2">{progress}% de la ruta académica</p>
        </div>
        <nav className="mt-8 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} data-active={active} className="nav-link">
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="mt-auto px-2">
          <button className="inline-flex items-center gap-2 text-sm text-mute" type="submit">
            <LogOut size={15} /> Salir
          </button>
        </form>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-8">
          <Link href="/dashboard" className="font-serif text-2xl text-cream lg:hidden">
            B&amp;B <span className="italic text-gold">Academy</span>
          </Link>
          <p className="hidden text-sm text-mute lg:block">{user.name}</p>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link href="/notificaciones" className="inline-flex items-center gap-1 text-mute">
              <Bell size={16} />
              {unread > 0 && <span className="rounded-full bg-gold px-1.5 text-[10px] font-semibold text-ink">{unread}</span>}
            </Link>
            <span className="hidden text-cream sm:inline">{user.name.split(" ")[0]}</span>
            <form action={logoutAction} className="lg:hidden">
              <button className="text-mute" type="submit">Salir</button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        <nav className="sticky bottom-0 flex gap-1 overflow-x-auto border-t border-gold/20 bg-[#0c0b0a] px-2 py-2 lg:hidden">
          {links.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} data-active={active} className="nav-link min-w-[72px] flex-col gap-1 px-2 py-2 text-[11px]">
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
