import Link from "next/link";
import { MetricsChart } from "@/components/metrics-chart";
import { Stat } from "@/components/ui";
import { metrics, outboxCount, recentAudit, recentMail } from "@/lib/db";
import { money } from "@/lib/format";

export const metadata = { title: "Administración" };

const links = [
  ["/admin/contenido", "Contenido"],
  ["/admin/examenes", "Exámenes"],
  ["/admin/alumnos", "Alumnos"],
  ["/admin/pagos", "Pagos"],
  ["/admin/lives", "Lives y repasos"],
  ["/admin/comunidad", "Moderación"],
  ["/admin/ranking", "Ranking y premios"],
  ["/admin/config", "Configuración"],
];

export default function AdminPage() {
  const data = metrics();
  const mail = outboxCount();
  const audit = recentAudit();
  const letters = recentMail();
  const conversion = data.students === 0 ? 0 : Math.round((data.paidEntries / data.students) * 100);
  const approval = data.graded === 0 ? 0 : Math.round((data.passed / data.graded) * 100);
  const chart = [
    { name: "Alumnos", value: data.students },
    { name: "Activas", value: data.active },
    { name: "Bajas", value: data.cancelled },
    { name: "Pendientes", value: data.pending },
    { name: "Aprobados", value: data.passed },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Operación</p>
          <h1 className="mt-2 font-serif text-5xl">Administración</h1>
        </div>
        <a className="btn-ghost" href="/api/admin/export">Exportar alumnos</a>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Alumnos" value={String(data.students)} />
        <Stat label="Membresías activas" value={String(data.active)} />
        <Stat label="Canceladas o vencidas" value={String(data.cancelled)} />
        <Stat label="Pago pendiente" value={String(data.pending)} />
        <Stat label="Ingresos" value={money(data.revenue)} />
        <Stat label="Conversión" value={`${conversion}%`} />
        <Stat label="Aprobación" value={`${approval}%`} />
        <Stat label="Correos en cola" value={String(mail.pending || 0)} />
      </div>
      <section className="card">
        <h2 className="font-serif text-2xl">Pulso de la academia</h2>
        <div className="mt-4">
          <MetricsChart data={chart} />
        </div>
      </section>
      <nav className="flex flex-wrap gap-2">
        {links.map(([href, label]) => (
          <Link key={href} className="btn-ghost" href={href}>{label}</Link>
        ))}
      </nav>
      <section className="card">
        <h2 className="font-serif text-2xl">Registro de acciones</h2>
        <ul className="mt-4 space-y-2 text-sm text-mute">
          {audit.map((row) => (
            <li key={row.id}>{row.created_at.slice(0, 16)} · {row.name || "sistema"} · {row.action} · {row.detail}</li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2 className="font-serif text-2xl">Correo saliente</h2>
        <ul className="mt-4 space-y-2 text-sm text-mute">
          {letters.length === 0 && <li>No hay correos en la bandeja.</li>}
          {letters.map((letter) => (
            <li key={letter.id}>{letter.sent ? "Enviado" : "En cola"} · {letter.to_email} · {letter.subject}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
