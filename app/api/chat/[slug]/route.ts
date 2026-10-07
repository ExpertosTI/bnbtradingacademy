import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { channelAllowed } from "@/lib/access";
import { getChannel, listMessages } from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ messages: [] }, { status: 401 });
  const { slug } = await context.params;
  const channel = getChannel(slug);
  if (!channel || !channelAllowed(user, channel.min_level, channel.requires_practical)) {
    return NextResponse.json({ messages: [] }, { status: 403 });
  }
  const after = Number(new URL(request.url).searchParams.get("after") || 0);
  const messages = listMessages(channel.id, Number.isFinite(after) ? after : 0).map((message) => ({
    id: message.id,
    body: message.deleted ? "" : message.body,
    deleted: message.deleted,
    created_at: message.created_at,
    name: message.name,
    role: message.role,
  }));
  return NextResponse.json({ messages });
}
