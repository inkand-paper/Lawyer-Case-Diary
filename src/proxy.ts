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
// In-memory store for rate limiting (Edge compatible)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function proxy(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  console.log(`[MIDDLEWARE] ${req.method} ${req.nextUrl.pathname} | IP: ${ip}`);
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // 0. Rate Limiting (Production Shield)
  if (!pathname.startsWith("/_next") && !pathname.includes(".")) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const limit = 10;

    let record = rateLimitStore.get(ip);
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
    }

    record.count++;
    rateLimitStore.set(ip, record);

    if (record.count > limit) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Too Many Requests", 
          message: "Legal Core is currently experiencing high volume. Please wait a moment.",
          retryAfter: new Date(record.resetAt).toISOString()
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 1. Strict CORS Enforcement (Production Standard)
  const isAllowed = isOriginAllowed(origin);
  if (origin && !isAllowed) {
    return new NextResponse(
      JSON.stringify({ error: "Security Violation", message: "Cross-Origin request blocked." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const res = NextResponse.next();
  const corsHeaders = getCorsHeaders(origin);

  // 2. Judicial Security Headers (Hardened)
  const securityHeaders = {
    ...corsHeaders,
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.pooler.supabase.com:5432 https://*.pooler.supabase.com:6543;",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload"
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // 3. Advanced Route Protection & RBAC
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isProtectedApi = pathname.startsWith("/api") && 
                         !pathname.startsWith("/api/auth") && 
                         !pathname.startsWith("/api/health") && 
                         !pathname.startsWith("/api/notifications/upcoming");

  if (isDashboard || isAdminPath || isProtectedApi) {
    let token = req.cookies.get("token")?.value;
    const authHeader = req.headers.get("authorization");
    
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      if (isDashboard || isAdminPath) return NextResponse.redirect(new URL("/login", req.url));
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Electronic session identity required." } }, { status: 401 });
    }

    try {
      if (token.includes(".")) {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        
        // RBAC: Admin exclusivity
        if (isAdminPath && payload.role !== "ADMIN") {
          return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Insufficient administrative clearance." } }, { status: 403 });
        }
      }
    } catch {
      if (isDashboard || isAdminPath) return NextResponse.redirect(new URL("/login", req.url));
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired session token." } }, { status: 401 });
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
