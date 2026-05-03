import { jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import db from "@/lib/db";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_dev_only"
);

async function getAuthUser() {
  try {
    let token: string | undefined;
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      if (token && token.includes(".")) {
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          return payload.userId as string;
        } catch { /* ignore */ }
      }
      if (token) {
        const keyHash = crypto.createHash("sha256").update(token).digest("hex");
        const apiKey = await db.apiKey.findUnique({
          where: { keyHash },
          select: { userId: true, id: true }
        });
        if (apiKey) {
          db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
          return apiKey.userId;
        }
      }
    }

    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
    if (!token) return null;

    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload.userId as string;
  } catch {
    return null;
  }
}

async function getAuthContext() {
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

export { getAuthUser, getAuthContext };
