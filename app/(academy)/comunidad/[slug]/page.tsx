import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatRoom } from "@/components/chat-room";
import { deleteOwnMessageAction } from "@/lib/actions/community";
import { getCurrentUser } from "@/lib/auth";
import { channelAllowed, courseAccess, isStaff } from "@/lib/access";
import { getChannel, listChannels, listMessages } from "@/lib/db";

export default async function CanalPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { slug } = await params;
  const channel = getChannel(slug);
  if (!channel) notFound();
  const channels = listChannels();
  const allowed = channelAllowed(user, channel.min_level, channel.requires_practical);
  const messages = allowed ? listMessages(channel.id) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-2">
        <p className="eyebrow">Salas</p>
        {channels.map((item) => (
          <Link key={item.id} href={`/comunidad/${item.slug}`} className="block rounded-2xl px-3 py-2 text-sm hover:bg-white/5" data-active={item.slug === slug}>
            {item.name}
          </Link>
        ))}
      </aside>
      <div>
        <h1 className="font-serif text-4xl">{channel.name}</h1>
        <p className="mb-4 mt-2 text-mute">{channel.description}</p>
        {!courseAccess(user) && user.role === "student" ? (
          <p className="card">La comunidad se abre con la inscripción.</p>
        ) : !allowed ? (
          <p className="card">Esta sala corresponde a un nivel que todavía no tienes.</p>
        ) : (
          <>
            <ChatRoom
              slug={channel.slug}
              canPost={!channel.staff_only_post || isStaff(user)}
              staff={isStaff(user)}
              initial={messages.map((message) => ({
                id: message.id,
                body: message.body,
                deleted: message.deleted,
                created_at: message.created_at,
                name: message.name,
                role: message.role,
              }))}
            />
            {isStaff(user) && (
              <form action={deleteOwnMessageAction} className="mt-4 flex gap-2">
                <input className="field" name="message_id" placeholder="ID del mensaje a retirar" />
                <input type="hidden" name="slug" value={slug} />
                <button className="btn-danger" type="submit">Retirar</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
