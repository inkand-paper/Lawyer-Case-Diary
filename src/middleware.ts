import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_dev_only"
);

/**
 * Global Security & Auth Middleware
 * ─────────────────────────────────────────────────────────────
 * 1. Implements strict Security Headers (CSP, HSTS, etc.)
 * 2. Protects /dashboard and /api routes.
 * 3. Supports dual-mode auth (Cookie + Bearer).
 * ─────────────────────────────────────────────────────────────
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // 1. Add Professional Security Headers
  const securityHeaders = {
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "origin-when-cross-origin",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // 2. Route Protection Logic
  const isDashboard = pathname.startsWith("/dashboard");
  const isProtectedApi = pathname.startsWith("/api") && !pathname.startsWith("/api/auth") && !pathname.startsWith("/api/notifications/upcoming");

  if (isDashboard || isProtectedApi) {
    let token = req.cookies.get("token")?.value;

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // If no token at all, block immediately
    if (!token) {
      if (isDashboard) return NextResponse.redirect(new URL("/login", req.url));
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Auth required" } },
        { status: 401 }
      );
    }

    // For /dashboard, we strictly verify JWT
    // For /api, if it's not a JWT (doesn't have dots), we let it through 
    // and let the Route Handler verify it as an API Key (to avoid DB calls in middleware)
    if (isDashboard || token.includes(".")) {
      try {
        await jwtVerify(token, JWT_SECRET);
      } catch (error) {
        if (isDashboard) return NextResponse.redirect(new URL("/login", req.url));
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } },
          { status: 401 }
        );
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
