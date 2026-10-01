import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/features/admin/auth/session";

// Optimistic check only. Every admin page also calls requireAdmin() on the server.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  const onLogin = pathname === "/admin/login";

  if (onLogin && session) {
    return NextResponse.redirect(new URL("/admin", request.nextUrl));
  }
  if (!onLogin && !session) {
    const login = new URL("/admin/login", request.nextUrl);
    if (pathname !== "/admin") login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
