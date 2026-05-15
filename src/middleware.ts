import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getCorsHeaders, isOriginAllowed } from "./lib/cors";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_dev_only"
);

/**
 * Global Security & Auth Proxy (Next.js 16+)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // 1. Rate Limiting
  if (!pathname.startsWith("/_next") && !pathname.includes(".")) {
    const now = Date.now();
    const windowMs = 60000;
    const limit = 100;

    let record = rateLimitStore.get(ip);
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
    }

    record.count++;
    rateLimitStore.set(ip, record);

    if (record.count > limit) {
      const resetSeconds = Math.ceil((record.resetAt - now) / 1000);
      return new NextResponse(
        JSON.stringify({ error: "Too Many Requests", message: "High volume. Please wait." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": resetSeconds.toString(),
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetSeconds.toString()
          } 
        }
      );
    }
  }

  const res = NextResponse.next();

  // 2. CORS & Security Headers
  const isAllowed = isOriginAllowed(origin);
  if (origin && !isAllowed) {
    return new NextResponse(
      JSON.stringify({ error: "Security Violation", message: "CORS blocked." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const securityHeaders = {
    ...getCorsHeaders(origin),
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload"
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // 3. Auth Protection & RBAC
  const isProtected = pathname.startsWith("/dashboard") || 
                     pathname.startsWith("/admin") || 
                     (pathname.startsWith("/api") && !pathname.startsWith("/api/auth"));

  if (isProtected) {
    let token = req.cookies.get("token")?.value;
    const authHeader = req.headers.get("authorization");
    
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      if (!pathname.startsWith("/api")) return NextResponse.redirect(new URL("/login", req.url));
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      if (token.includes(".")) {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
          return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
      }
    } catch (err) {
      if (!pathname.startsWith("/api")) return NextResponse.redirect(new URL("/login", req.url));
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
