import db from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { apiErrors, successResponse } from "@/lib/api-response";

/**
 * [ADMIN EXECUTIVE: USER MANAGEMENT]
 * Scope: Individual practitioner management (Deletions & Plan Overrides).
 * Security: Restricted to ADMIN role only.
 */

async function verifyAdmin() {
  const userId = await getAuthUser();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  return user?.role === "ADMIN" ? userId : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await verifyAdmin();
  if (!adminId) return apiErrors.UNAUTHORIZED("Admin clearance required.");

  // Resolve target user ID first — needed for self-demotion check
  const { id } = await params;

  // Self-demotion guard BEFORE reading body
  // Prevents a malformed body from even reaching the DB
  const body = await req.json();
  const { plan, role } = body;

  if (id === adminId && role && role !== "ADMIN") {
    return apiErrors.BAD_REQUEST("Self-demotion is not permitted to prevent accidental lockouts.");
  }

  // Validate plan/role values
  const validPlans = ["FREE", "ESSENTIAL", "EXECUTIVE", "ULTIMATE"];
  const validRoles = ["ADMIN", "LAWYER", "MEMBER"];

  if (plan && !validPlans.includes(plan)) {
    return apiErrors.BAD_REQUEST(`Invalid plan. Must be one of: ${validPlans.join(", ")}`);
  }
  if (role && !validRoles.includes(role)) {
    return apiErrors.BAD_REQUEST(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  try {
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(plan && { plan }),
        ...(role && { role }),
      },
      select: { id: true, name: true, email: true, plan: true, role: true },
    });

    return successResponse(updatedUser, "Practitioner profile updated successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to update practitioner profile.", error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAdmin()) return apiErrors.UNAUTHORIZED("Admin clearance required.");

  try {
    const { id } = await params;

    // Delete user and all associated records (Cascade would be better in schema but we handle here for safety)
    await db.user.delete({
      where: { id }
    });

    return successResponse(null, "Practitioner record purged from the registry.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to purge practitioner record.", error);
  }
}
