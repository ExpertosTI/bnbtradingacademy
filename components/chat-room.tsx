"use client";

import { useEffect, useRef, useState } from "react";
import { postMessageAction, reportMessageAction, deleteOwnMessageAction } from "@/lib/actions/community";

type Row = {
  id: number;
  body: string;
  deleted: number;
  created_at: string;
  name?: string;
  role?: string;
};

export function ChatRoom({
  slug,
  initial,
  canPost,
  staff,
}: {
  slug: string;
  initial: Row[];
  canPost: boolean;
  staff: boolean;
}) {
  const [messages, setMessages] = useState(initial);
  const list = useRef(initial);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current = initial;
    setMessages(initial);
  }, [initial]);

  useEffect(() => {
    const id = setInterval(async () => {
      const last = list.current[list.current.length - 1]?.id ?? 0;
      const response = await fetch(`/api/chat/${slug}?after=${last}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { messages: Row[] };
      if (!data.messages?.length) return;
      list.current = [...list.current, ...data.messages];
      setMessages(list.current);
    }, 4000);
    return () => clearInterval(id);
  }, [slug]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  return (
    <div className="card flex h-[68vh] flex-col">
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((message) => (
          <article key={message.id} className="border-b border-white/5 pb-3">
            <p className="text-sm text-gold2">
              {message.name} <span className="font-mono text-[10px] uppercase text-mute">{message.role}</span>
            </p>
            <p className="mt-1 whitespace-pre-wrap text-cream">{message.deleted ? "Mensaje retirado por moderación." : message.body}</p>
            {staff && !message.deleted && (
              <form action={deleteOwnMessageAction}>
                <input type="hidden" name="message_id" value={message.id} />
                <input type="hidden" name="slug" value={slug} />
                <button className="text-xs text-bad" type="submit">Retirar</button>
              </form>
            )}
            {!message.deleted && (
              <form action={reportMessageAction} className="mt-2 flex gap-2">
                <input type="hidden" name="message_id" value={message.id} />
                <input type="hidden" name="slug" value={slug} />
                <input className="field max-w-xs" name="reason" placeholder="Reportar este mensaje" />
                <button className="text-xs text-mute" type="submit">
                  Reportar
                </button>
              </form>
            )}
          </article>
        ))}
      </div>
      {canPost ? (
        <form
          action={async (formData) => {
            await postMessageAction(formData);
            const response = await fetch(`/api/chat/${slug}?after=${list.current[list.current.length - 1]?.id ?? 0}`, { cache: "no-store" });
            if (!response.ok) return;
            const data = (await response.json()) as { messages: Row[] };
            if (!data.messages?.length) return;
            list.current = [...list.current, ...data.messages];
            setMessages(list.current);
          }}
          className="mt-4 flex gap-2"
        >
          <input type="hidden" name="slug" value={slug} />
          <input className="field" name="body" maxLength={1000} placeholder={staff ? "Escribe a la academia" : "Escribe tu mensaje"} required />
          <button className="btn-gold" type="submit">
            Enviar
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-mute">En anuncios solo publican profesores y administración.</p>
      )}
    </div>
  );
}
