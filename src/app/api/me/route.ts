/**
 * Professional Session Identity API
 * Scope: Authenticated user profile retrieval and session introspection.
 * Security: Session-verified via centralized getAuthUser helper.
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";

/**
 * GET Handler: Session Profile Introspection
 * Returns the authenticated lawyer's profile and authorization level.
 */
export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return apiErrors.NOT_FOUND("User profile could not be located in the registry.");

    return successResponse(user, "Session identity verified.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to retrieve session profile.", error);
  }
}
