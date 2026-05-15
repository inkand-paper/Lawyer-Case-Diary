import { getAuthContext } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * ADMINISTRATIVE AUDIT LOG API
 * Scope: System-wide observability for administrators.
 * Security: Restricted to ADMIN role in middleware.
 */
export async function GET(req: Request) {
  const user = await getAuthContext();
  // middleware should have blocked this, but we check again for defense-in-depth
  if (!user || user.role !== "ADMIN") {
    return apiErrors.FORBIDDEN("Administrative clearance required to view audit logs.");
  }

  try {
    const url = new URL(req.url);
    const level = url.searchParams.get("level") || undefined;
    const limit = Number(url.searchParams.get("limit")) || 100;

    const logs = await db.log.findMany({
      where: level ? { level } : {},
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return successResponse(logs, "System audit logs retrieved successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to retrieve audit logs.", error);
  }
}
