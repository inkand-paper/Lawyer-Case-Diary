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
    // 1. Idempotency Check (Production Safeguard)
    const idempotencyKey = req.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      const { getIdempotentResponse } = await import("@/lib/idempotency");
      const cachedResponse = await getIdempotentResponse(userId, idempotencyKey);
      if (cachedResponse) return cachedResponse;
    }

    const body = await req.json();
    
    // 2. Structural Validation (Zod)
    const validationResult = hearingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    // 3. Persistent Enrollment
    const hearing = await createHearing(userId, validationResult.data);
    const response = successResponse(hearing, "Hearing successfully enrolled in the procedural timeline.", 201);

    // 4. Save for Idempotency if key provided
    if (idempotencyKey) {
      const { saveIdempotentResponse } = await import("@/lib/idempotency");
      await saveIdempotentResponse(userId, idempotencyKey, response as import("next/server").NextResponse);
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return apiErrors.SERVER_ERROR(message || "A critical failure occurred during hearing enrollment.", error);
  }
}
