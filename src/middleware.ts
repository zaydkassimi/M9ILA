import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = new Set([
  process.env.NEXTAUTH_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean));

function isSafeMethod(method: string): boolean {
  return ["GET", "HEAD", "OPTIONS"].includes(method);
}

function verifyOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    return ALLOWED_ORIGINS.has(origin);
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      return ALLOWED_ORIGINS.has(refererOrigin);
    } catch {
      return false;
    }
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Security headers on every response
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://picsum.photos https://upload.wikimedia.org data: blob:; font-src 'self' data:; connect-src 'self' https://openrouter.ai; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");

  // Let all auth routes pass through without interference
  if (pathname.startsWith("/api/auth")) {
    return response;
  }

  // CSRF protection: verify Origin/Referer on state-changing API requests
  if (!isSafeMethod(request.method) && pathname.startsWith("/api/")) {
    if (!verifyOrigin(request)) {
      return NextResponse.json({ error: "Requête interdite" }, { status: 403 });
    }
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|uploads/).*)"],
};
