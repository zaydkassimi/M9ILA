import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Let all auth routes pass through without interference
  if (pathname.startsWith("/api/auth")) {
    return response;
  }

  // Protect admin pages
  if (pathname.startsWith("/admin")) {
    const tokenCookie = request.cookies.get("next-auth.session-token") ||
                        request.cookies.get("__Secure-next-auth.session-token");
    if (!tokenCookie) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/upload")) {
    const tokenCookie = request.cookies.get("next-auth.session-token") ||
                        request.cookies.get("__Secure-next-auth.session-token");
    if (!tokenCookie) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
