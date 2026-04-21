/**
 * Professional Hearing Schedule API
 * Scope: Procedural timeline management for court sessions.
 * Security: Session-verified, scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import { createHearing } from "@/lib/services/hearing.service";
import { hearingSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";

/**
 * GET Handler: Chronological Hearing Recovery
 * Recovers all hearings associated with the practitioner's portfolio.
 */
export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const hearings = await db.hearing.findMany({
      where: { case: { userId } },
      include: { case: true },
      orderBy: { hearingDate: "asc" },
    });
    return successResponse(hearings, "Hearing schedule synchronized successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to recover hearing data from the legal core.", error);
  }
}

/**
 * POST Handler: Procedural Hearing Enrollment
 * Enrolls a new court session into the case timeline.
 */
export async function POST(req: Request) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Authorization required for hearing enrollment.");

  try {
    const body = await req.json();
    
    // 1. Structural Validation (Zod)
    const validationResult = hearingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    // 2. Persistent Enrollment
    const hearing = await createHearing(userId, validationResult.data);
    return successResponse(hearing, "Hearing successfully enrolled in the procedural timeline.", 201);
  } catch (error: any) {
    return apiErrors.SERVER_ERROR(error.message || "A critical failure occurred during hearing enrollment.", error);
  }
}
