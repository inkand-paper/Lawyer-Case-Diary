import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { apiErrors, successResponse } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

/**
 * [ADMIN: USER LIST]
 * Scope: Management of all users.
 * Security: Restricted to ADMIN role only.
 */
export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Session expired.");

  // 1. Verify ADMIN privileges
  const admin = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (admin?.role !== "ADMIN") {
    return apiErrors.UNAUTHORIZED("Access Restricted: Admin clearance required.");
  }

  try {
    // 2. Aggregate all legal professionals with metrics
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            cases: true,
            clients: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return successResponse(users, "Users retrieved successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to get users.", error);
  }
}
