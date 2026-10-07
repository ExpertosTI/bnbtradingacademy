import { moderateUserAction } from "@/lib/actions/admin";
import { academicLevel, stageUnlocked } from "@/lib/access";
import { getUser, listStudents } from "@/lib/db";
import { experienceLabel, membershipLabel } from "@/lib/format";

export const metadata = { title: "Alumnos" };

export default function AlumnosPage() {
  const students = listStudents();
  return (
    <div>
      <h1 className="font-serif text-5xl">Alumnos</h1>
      <div className="mt-6 space-y-3">
        {students.map((student) => {
          const full = getUser(student.id);
          return (
            <article key={student.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-2xl">{student.name}</p>
                <p className="text-sm text-mute">{student.email} · {experienceLabel(student.experience)} · {full ? (stageUnlocked(full) ? "Práctica" : `Nivel ${academicLevel(full)}`) : ""} · {membershipLabel(student.membership_status)}</p>
              </div>
              <form action={moderateUserAction} className="flex gap-2">
                <input type="hidden" name="user_id" value={student.id} />
                <button className="btn-ghost" name="action" value={student.suspended ? "restore" : "suspend"} type="submit">{student.suspended ? "Reactivar" : "Suspender"}</button>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
