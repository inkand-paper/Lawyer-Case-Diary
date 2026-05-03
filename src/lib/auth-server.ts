import { jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import db from "@/lib/db";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_dev_only"
);

/**
 * Server-Side Authentication Helper
 * Extracts and verifies the JWT from 'Authorization: Bearer <token>' OR cookies.
 * Also supports permanent API Keys for mobile/external integrations.
 * @returns userId string or null if unauthorized.
 */
export async function getAuthUser() {
  try {
    let token: string | undefined;

    // 1. Check for Authorization Header
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      
      // 1.1 Check if it's a JWT or a Raw API Key
      // If it's a long JWT (usually contains dots), try JWT verify
      if (token.includes(".")) {
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          return payload.userId as string;
        } catch {
          // If JWT fails, it might be an API Key? Continue to next check
        }
      }

      // 1.2 Check if it's a Database API Key
      const keyHash = crypto.createHash("sha256").update(token).digest("hex");
      const apiKey = await db.apiKey.findUnique({
        where: { keyHash },
        select: { userId: true, id: true }
      });

      if (apiKey) {
        // Update last used timestamp (fire and forget)
        db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
        return apiKey.userId;
      }
    }

    // 2. Fallback to Web Session Cookie
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;

    if (!token) return null;

    // 3. Verify JWT Signature
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}
/**
 * Verifies authentication and returns full user context (including chamberId).
 */
export async function getAuthContext() {
  const userId = await getAuthUser();
  if (!userId) return null;

  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      chamberId: true,
    },
  });
}
