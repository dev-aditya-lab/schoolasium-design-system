import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// /employee-portal is the login/portal page — it handles auth state client-side.
// Only /admin routes need server-side middleware protection.
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes handle their own auth
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (!isAdmin) return NextResponse.next();

  const token   = request.cookies.get(COOKIE_NAME)?.value ?? null;
  const payload = token ? verifyToken(token) : null;

  // Not authenticated → send to login
  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/employee-portal";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated but wrong role
  if (payload.role !== "admin" && payload.role !== "super_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/employee-portal";
    return NextResponse.redirect(url);
  }

  // Pass user identity to server components via headers
  const response = NextResponse.next();
  response.headers.set("x-user-id",   payload.sub);
  response.headers.set("x-user-role", payload.role);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
