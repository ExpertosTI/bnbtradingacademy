import { redirect } from "next/navigation";
import { saveExperienceAction } from "@/lib/actions/billing";
import { getCurrentUser } from "@/lib/auth";
import { attemptCountForUser } from "@/lib/db";
import { experienceLabel } from "@/lib/format";

export const metadata = { title: "Diagnóstico" };

export default async function DiagnosticoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locked = attemptCountForUser(user.id) > 0;
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Ruta</p>
      <h1 className="mt-3 font-serif text-5xl">Experiencia declarada</h1>
      <p className="mt-3 text-mute">Hoy estás como {experienceLabel(user.experience)}. Cambiarla no aprueba exámenes.</p>
      {locked ? (
        <p className="card mt-6">Ya presentaste un examen, así que la ruta queda fija.</p>
      ) : (
        <form action={saveExperienceAction} className="card mt-6 space-y-3">
          <label className="flex gap-2"><input type="radio" name="experience" value="beginner" defaultChecked={user.experience === "beginner"} /> Principiante</label>
          <label className="flex gap-2"><input type="radio" name="experience" value="intermediate" defaultChecked={user.experience === "intermediate"} /> Intermedio</label>
          <label className="flex gap-2"><input type="radio" name="experience" value="advanced" defaultChecked={user.experience === "advanced"} /> Avanzado</label>
          <button className="btn-gold" type="submit">Guardar ruta</button>
        </form>
      )}
    </div>
  );
}
