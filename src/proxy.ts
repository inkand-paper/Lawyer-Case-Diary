import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getCorsHeaders, isOriginAllowed } from "./lib/cors";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_dev_only"
);

/**
 * Global Security & Auth Proxy (Next.js 16+)
 * ─────────────────────────────────────────────────────────────
 * 1. CORS Enforcement
 * 2. Advanced Security Headers (CSP, HSTS, XSS Protection)
 * 3. Route Protection (/dashboard, /admin, /api)
 * 4. Executive RBAC (Role-Based Access Control)
 * ─────────────────────────────────────────────────────────────
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // 1. CORS Enforcement
  if (!isOriginAllowed(origin)) {
    return new NextResponse(
      JSON.stringify({ error: "CORS Security Error", message: "Unauthorized origin." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const res = NextResponse.next();
  const corsHeaders = getCorsHeaders(origin);

  // 2. Advanced Judicial Security Headers (The Great Wall)
  const securityHeaders = {
    ...corsHeaders,
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://aws-1-ap-northeast-1.pooler.supabase.com:5432 https://aws-1-ap-northeast-1.pooler.supabase.com:6543;",
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // 3. Route Protection
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminPath = pathname.startsWith("/admin");
  const isProtectedApi = pathname.startsWith("/api") && 
                         !pathname.startsWith("/api/auth") && 
                         !pathname.startsWith("/api/notifications/upcoming");

  if (isDashboard || isAdminPath || isProtectedApi) {
    let token = req.cookies.get("token")?.value;

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      if (isDashboard || isAdminPath) return NextResponse.redirect(new URL("/login", req.url));
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Auth required" } }, { status: 401 });
    }

    try {
      if (token.includes(".")) {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        
        // 4. Executive RBAC: Verify ADMIN role for administrative routes
        if (isAdminPath && payload.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    } catch (_error) {
      if (isDashboard || isAdminPath) return NextResponse.redirect(new URL("/login", req.url));
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } }, { status: 401 });
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
