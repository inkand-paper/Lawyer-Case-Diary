/**
 * Professional Case Detail API — Dynamic Route Handler
 * Scope: Single-record operations (Read, Update, Delete) for a specific legal case.
 * Security: Session-verified, ownership-scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import { getCaseById, updateCase, deleteCase } from "@/lib/services/case.service";
import { caseUpdateSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET Handler: Single Case Deep-Fetch
 * Retrieves a case with full relationship depth (Hearings, Notes, Payments).
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const caseRecord = await getCaseById(userId, id);
    if (!caseRecord) return apiErrors.NOT_FOUND("Case record not found in the legal core.");
    return successResponse(caseRecord, "Case record retrieved successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to retrieve case record.", error);
  }
}

/**
 * PUT Handler: Procedural Case Update
 * Updates fields on an existing case record.
 */
export async function PUT(req: Request, { params }: RouteParams) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const body = await req.json();

    // 1. Partial Structural Validation
    const validationResult = caseUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    // 2. Ownership-Verified Update
    const updatedCase = await updateCase(userId, id, validationResult.data);
    return successResponse(updatedCase, "Case record updated successfully.");
  } catch (error: any) {
    if (error.code === "P2025") return apiErrors.NOT_FOUND("Case record not found or not authorized.");
    return apiErrors.SERVER_ERROR("Failed to update case record.", error);
  }
}

/**
 * DELETE Handler: Permanent Case Removal
 * Irreversibly removes a case from the legal registry.
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const deletedCase = await deleteCase(userId, id);
    return successResponse(deletedCase, "Case permanently removed from the legal registry.");
  } catch (error: any) {
    if (error.code === "P2025") return apiErrors.NOT_FOUND("Case record not found or not authorized.");
    return apiErrors.SERVER_ERROR("Failed to remove case record.", error);
  }
}
