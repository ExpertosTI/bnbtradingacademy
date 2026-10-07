import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/cursos",
  "/leccion",
  "/examen",
  "/resultado",
  "/live",
  "/repaso",
  "/comunidad",
  "/perfil",
  "/pagos",
  "/checkout",
  "/profesor",
  "/admin",
  "/notificaciones",
  "/diagnostico",
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const needsAuth = protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  if (!needsAuth) return NextResponse.next();
  if (request.cookies.get("bb_session")?.value) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|api/avatar).*)"],
};
