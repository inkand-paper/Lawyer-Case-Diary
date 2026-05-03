/**
 * Professional Hearing Detail API — Dynamic Route Handler
 * Scope: Single-record operations (Read, Update, Delete) for a specific hearing.
 * Security: Session-verified, ownership validated via parent Case relation.
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import { updateHearing, deleteHearing } from "@/lib/services/hearing.service";
import { hearingUpdateSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET Handler: Single Hearing Record Retrieval
 * Fetches a hearing with its parent case relationship.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const hearing = await db.hearing.findFirst({
      where: { id, case: { userId } },
      include: { case: true },
    });
    if (!hearing) return apiErrors.NOT_FOUND("Hearing record not found in the procedural timeline.");
    return successResponse(hearing, "Hearing record retrieved successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to retrieve hearing record.", error);
  }
}

/**
 * PUT Handler: Hearing Event Update
 * Updates the schedule or notes for a specific court session.
 */
export async function PUT(req: Request, { params }: RouteParams) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const body = await req.json();

    const validationResult = hearingUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    const updatedHearing = await updateHearing(userId, id, validationResult.data);
    return successResponse(updatedHearing, "Hearing schedule updated successfully.");
  } catch (error: unknown) {
    if (error.message?.includes("not found")) return apiErrors.NOT_FOUND(error.message);
    return apiErrors.SERVER_ERROR("Failed to update hearing record.", error);
  }
}

/**
 * DELETE Handler: Hearing Event Removal
 * Permanently removes a hearing session from the case timeline.
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const deletedHearing = await deleteHearing(userId, id);
    return successResponse(deletedHearing, "Hearing permanently removed from the procedural timeline.");
  } catch (error: unknown) {
    if (error.message?.includes("not found")) return apiErrors.NOT_FOUND(error.message);
    return apiErrors.SERVER_ERROR("Failed to remove hearing record.", error);
  }
}
