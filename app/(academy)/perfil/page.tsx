import { redirect } from "next/navigation";
import { changePasswordAction, saveProfileAction, uploadAvatarAction } from "@/lib/actions/profile";
import { getCurrentUser } from "@/lib/auth";
import { badgesFor } from "@/lib/db";
import { currentLevelLabel } from "@/lib/access";
import { experienceLabel } from "@/lib/format";

export const metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const badges = badgesFor(user.id);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 font-serif text-2xl">{user.name.slice(0, 1)}</div>
          )}
          <div>
            <h1 className="font-serif text-4xl">{user.name}</h1>
            <p className="text-sm text-mute">{experienceLabel(user.experience)} · {currentLevelLabel(user)}</p>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm text-gold2">{badges.map((badge) => <li key={badge.code}>{badge.label}</li>)}</ul>
        <form action={uploadAvatarAction} className="mt-6 space-y-3">
          <label className="label" htmlFor="avatar">Fotografía</label>
          <input id="avatar" name="avatar" type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" />
          <button className="btn-ghost" type="submit">Subir</button>
        </form>
        <form action={saveProfileAction} className="mt-6 space-y-3">
          <label className="block"><span className="label">Nombre</span><input className="field" name="name" defaultValue={user.name} /></label>
          <label className="block"><span className="label">Bio</span><textarea className="field" name="bio" defaultValue={user.bio} rows={3} /></label>
          <button className="btn-gold" type="submit">Guardar perfil</button>
        </form>
      </section>
      <section className="card">
        <h2 className="font-serif text-3xl">Contraseña</h2>
        <form action={changePasswordAction} className="mt-4 space-y-3">
          <input className="field" type="password" name="current" placeholder="Contraseña actual" required />
          <input className="field" type="password" name="next" placeholder="Nueva contraseña" minLength={8} required />
          <button className="btn-gold" type="submit">Actualizar</button>
        </form>
        <p className="mt-6 text-sm text-mute">{user.email}</p>
      </section>
    </div>
  );
}
