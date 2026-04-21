import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_dev_only"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Paths that require authentication
  const isDashboard = pathname.startsWith("/dashboard");
  const isProtectedApi = pathname.startsWith("/api") && !pathname.startsWith("/api/auth");

  if (isDashboard || isProtectedApi) {
    let token = req.cookies.get("token")?.value;

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      if (isDashboard) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Auth required" } },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      if (isDashboard) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
