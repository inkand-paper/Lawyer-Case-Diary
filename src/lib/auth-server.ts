import { jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_dev_only"
);

/**
 * Server-Side Authentication Helper
 * Extracts and verifies the JWT from 'Authorization: Bearer <token>' OR cookies.
 * This ensures 100% compatibility with Android/Mobile API integrations.
 * @returns userId string or null if unauthorized.
 */
export async function getAuthUser() {
  try {
    let token: string | undefined;

    // 1. Check for Mobile/API Bearer Token
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Fallback to Web Session Cookie
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    }

    if (!token) return null;

    // 3. Verify Signature
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

