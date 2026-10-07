import { getCurrentUser } from "@/lib/auth";
import { academicLevel, stageUnlocked } from "@/lib/access";
import { getUser, listStudents } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return new Response("No autorizado", { status: 403 });
  const rows = [["nombre", "correo", "experiencia", "membresia", "nivel", "alta"]];
  for (const student of listStudents()) {
    const full = getUser(student.id);
    rows.push([
      student.name,
      student.email,
      student.experience || "",
      student.membership_status || "",
      full ? (stageUnlocked(full) ? "practica" : String(academicLevel(full))) : "",
      student.created_at,
    ]);
  }
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=alumnos.csv",
    },
  });
}
