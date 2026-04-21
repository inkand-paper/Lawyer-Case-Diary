/**
 * Professional Case Management API
 * Scope: Registry-wide handling of legal case records.
 * Security: Session-verified, scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import { createCase, getCases } from "@/lib/services/case.service";
import { caseSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";

/**
 * GET Handler: High-Performance Registry Recovery
 * Fetches the complete chronological case history for the practitioner.
 */
export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const cases = await getCases(userId);
    return successResponse(cases, "Case registry synchronized successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to recover case data from the legal core.", error);
  }
}

/**
 * POST Handler: Procedural Case Initialization
 * Validates and persists a new legal case into the permanent record.
 */
export async function POST(req: Request) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Authorization required for case initialization.");

  try {
    const body = await req.json();
    
    // 1. Structural Validation (Zod)
    const validationResult = caseSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    // 2. Persistent Enrollment
    const newCase = await createCase(userId, validationResult.data);
    return successResponse(newCase, "Case successfully enrolled in the diary system.", 201);
  } catch (error: any) {
    return apiErrors.SERVER_ERROR("A critical failure occurred while enrolling the case record.", error);
  }
}
