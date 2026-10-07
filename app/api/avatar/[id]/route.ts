import fs from "fs";
import path from "path";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return new Response("No encontrado", { status: 404 });
  const file = path.join(process.cwd(), "data", "avatars", `${id}.img`);
  if (!fs.existsSync(file)) return new Response("No encontrado", { status: 404 });
  const bytes = fs.readFileSync(file);
  const type = bytes[0] === 0x89 ? "image/png" : bytes[0] === 0xff ? "image/jpeg" : "image/webp";
  return new Response(bytes, { headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" } });
}
