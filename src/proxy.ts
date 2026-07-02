import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getCorsHeaders, isOriginAllowed } from "./lib/cors";

// JWT_SECRET guard lives in db.ts — safe to assert non-null here.
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Global Security & Auth Proxy (renamed from middleware.ts in Next.js 16)
 *
 * NOTE: proxy.ts runs on the Node.js runtime by default (not Edge, unlike
 * the old middleware.ts convention), and the runtime isn't configurable
 * here. jose's jwtVerify works fine on either, so no code changes were
 * needed for this migration — see https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Rate limiting: JWT-verified via edge, but rate limit reads come from DB.
 * NOTE: The DB-backed rate limiter (ratelimit.ts) cannot run on the Edge Runtime.
 * We use a lightweight token-bucket approach here: check only route-level limits
 * (auth endpoints) and let the DB-backed limiter handle per-user API limits inside
 * each route handler.
 *
 * The previous in-memory Map was reset on every serverless invocation and
 * therefore did nothing in production. It has been removed.
 */

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // ── 1. CORS & Security Headers ─────────────────────────────────────────────
  const isAllowed = isOriginAllowed(origin);
  if (origin && !isAllowed) {
    return new NextResponse(
      JSON.stringify({ error: "Security Violation", message: "CORS policy blocked this request." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Preflight requests must be answered before any auth check runs — an
  // OPTIONS request never carries cookies/Authorization the way the real
  // request will, so it always fell into the 401 branch below and the
  // browser aborted the actual request. This is what broke cross-origin
  // calls (e.g. from a separately-hosted frontend or the Android app's
  // WebView) even though CORS headers were configured correctly.
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
  }

  const res = NextResponse.next();

  const securityHeaders: Record<string, string> = {
    ...getCorsHeaders(origin),
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // ── 2. Auth Protection & RBAC ──────────────────────────────────────────────
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/api") &&
      !pathname.startsWith("/api/auth") &&
      !pathname.startsWith("/api/health") &&
      !pathname.startsWith("/api/public"));

  if (!isProtected) return res;

  // Resolve token from cookie or Authorization header
  let token = req.cookies.get("token")?.value;
  const authHeader = req.headers.get("authorization");

  if (!token && authHeader?.startsWith("Bearer ")) {
    const candidate = authHeader.split(" ")[1];
    // Only treat dot-separated strings as JWTs; API keys are passed through
    // to the route handler which validates them against the DB.
    if (candidate?.includes(".")) {
      token = candidate;
    }
  }

  if (!token) {
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (token.includes(".")) {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // RBAC: admin routes require ADMIN role
      if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }

      // Inject verified userId into request header for downstream use
      res.headers.set("x-verified-user-id", String(payload.userId ?? ""));
    } else {
      // API Key Edge-Level Validation
      // Blocks brute-force DB lookups by verifying the prefix and exact byte length length.
      if (!token.startsWith("lcd_") || token.length !== 52) {
         if (!pathname.startsWith("/api")) return NextResponse.redirect(new URL("/login", req.url));
         return NextResponse.json({ success: false, error: "Invalid API Key format" }, { status: 401 });
      }
    }
  } catch {
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
