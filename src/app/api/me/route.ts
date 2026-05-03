/**
 * ============================================================
 * Professional Session Identity API
 * Scope:    Authenticated user profile retrieval and live update.
 * Security: Session-verified via centralised getAuthUser helper.
 *           Password changes handled by a dedicated endpoint.
 * ============================================================
 */

export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";
import { profileUpdateSchema } from "@/lib/validators";

/**
 * GET /api/me
 * Returns the authenticated lawyer's profile.
 */
export async function GET() {
  const userId = await getAuthUser();
  if (!userId)
    return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true },
    });

    if (!user)
      return apiErrors.NOT_FOUND(
        "User profile could not be located in the registry."
      );

    return successResponse(user, "Session identity verified.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to retrieve session profile.", error);
  }
}

/**
 * PATCH /api/me
 * Updates name / email on the authenticated user's profile.
 * Does NOT handle password changes — use /api/auth/change-password for that.
 */
export async function PATCH(req: Request) {
  const userId = await getAuthUser();
  if (!userId)
    return apiErrors.UNAUTHORIZED("Authorization required to modify profile.");

  try {
    const body = await req.json();

    // 1. Validate payload
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(
        validationResult.error.issues[0].message
      );
    }

    const { data } = validationResult;
    if (!data.name && !data.email) {
      return apiErrors.BAD_REQUEST(
        "At least one field (name or email) must be provided."
      );
    }

    // 2. Check for email conflict before updating
    if (data.email) {
      const conflict = await db.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
      });
      if (conflict) {
        return apiErrors.BAD_REQUEST(
          "This email address is already in use by another account."
        );
      }
    }

    // 3. Persist update
    const updated = await db.user.update({
      where: { id: userId },
      data: { ...(data.name && { name: data.name }), ...(data.email && { email: data.email }) },
      select: { id: true, name: true, email: true, role: true, plan: true },
    });

    return successResponse(updated, "Profile updated successfully.");
  } catch (error: any) {
    return apiErrors.SERVER_ERROR("Failed to update profile.", error);
  }
}
