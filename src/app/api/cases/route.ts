/**
 * Professional Case Management API
 * Scope: Registry-wide handling of legal case records.
 * Security: Session-verified, scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthContext } from "@/lib/auth-server";
import { createCase, getCases } from "@/lib/services/case.service";
import { caseSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import { logger } from "@/lib/services/logger.service";

/**
 * GET Handler: High-Performance Registry Recovery
 * Fetches the complete chronological case history for the practitioner with pagination.
 */
export async function GET(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit")) || 50;
    const offset = Number(url.searchParams.get("offset")) || 0;

    const cases = await getCases(user.id, user.chamberId, limit, offset);
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
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Authorization required for case initialization.");

  try {
    const body = await req.json();
    
    // 1. Script-Injection Sanitization (XSS Shield)
    const { sanitizeObject } = await import("@/lib/sanitizer");
    const sanitizedBody = sanitizeObject(body);

    // 2. Structural Validation (Zod)
    const validationResult = caseSchema.safeParse(sanitizedBody);
    if (!validationResult.success) {
      await logger.warn("Case creation failed Zod validation", { userId: user.id, errors: validationResult.error.issues });
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    // 3. Plan Limit Enforcement
    if (user.plan === "ESSENTIAL") {
      const { default: db } = await import("@/lib/db");
      const caseCount = await db.case.count({ where: { userId: user.id } });
      if (caseCount >= 50) {
        return apiErrors.FORBIDDEN("Case limit reached! The Basic plan only allows 50 cases. Please upgrade to Pro to add more.");
      }
    }

    // 4. Persistent Enrollment
    const newCase = await createCase(user.id, user.chamberId, validationResult.data);
    
    // Log mutation per Backend Spec
    await logger.info("New case initialized", { 
      userId: user.id, 
      caseId: newCase.id, 
      caseNumber: newCase.caseNumber 
    });

    return successResponse(newCase, "Case successfully enrolled in the diary system.", 201);
  } catch (error: unknown) {
    await logger.error("A critical failure occurred while enrolling the case record.", error, { userId: user.id });
    return apiErrors.SERVER_ERROR("A critical failure occurred while enrolling the case record.", error);
  }
}
