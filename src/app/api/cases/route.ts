/**
 * Professional Case Management API
 * Scope: Registry-wide handling of legal case records.
 * Security: Session-verified, scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthContext } from "@/lib/auth-server";
import { createCase, getCases } from "@/lib/services/case.service";
import { checkCaseLimit } from "@/lib/services/plan.service";
import { caseSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import { logger } from "@/lib/services/logger.service";
import { validateRequest } from "@/lib/request-handler";
import { getPagination } from "@/lib/pagination";

/**
 * GET Handler: High-Performance Registry Recovery
 */
export async function GET(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const { limit, offset } = getPagination(req.url);

    const cases = await getCases(user.id, user.chamberId, limit, offset);
    return successResponse(cases, "Case registry synchronized successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to recover case data from the legal core.", error);
  }
}

/**
 * POST Handler: Procedural Case Initialization
 */
export async function POST(req: Request) {
  const user = await getAuthContext();
  if (!user) {
    return apiErrors.UNAUTHORIZED("Authorization required for case initialization.");
  }

  // 1. Unified Validation & Sanitization (SOLID: S)
  const validation = await validateRequest(req, caseSchema);
  if (!validation.success) {
    return apiErrors.BAD_REQUEST(validation.error);
  }

  try {
    // 2. Plan Limit Enforcement (SOLID: S)
    await checkCaseLimit(user.id, user.plan);

    // 3. Persistent Enrollment
    const newCase = await createCase(user.id, user.chamberId, validation.data);
    
    return successResponse(newCase, "Case successfully enrolled in the diary system.", 201);
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isPlanLimit = errorMsg.includes("Plan Limit");
    const message = isPlanLimit ? errorMsg : "A critical failure occurred while enrolling the case record.";
      
    await logger.error(message, error, { userId: user.id });
    
    return isPlanLimit
      ? apiErrors.FORBIDDEN(message)
      : apiErrors.SERVER_ERROR(message, error);
  }
}
