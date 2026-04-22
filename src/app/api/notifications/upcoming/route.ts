/**
 * Judicial Notification Engine
 * Scope: Real-time alerts for imminent hearings (T-minus 60 minutes).
 * Logic: Filters sessions starting within the next hour that haven't passed yet.
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";

export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Session expired.");

  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Fetch hearings for the practitioner's cases within the 1-hour window
    const imminentHearings = await db.hearing.findMany({
      where: {
        case: { userId },
        hearingDate: {
          gt: now,
          lte: oneHourFromNow,
        },
      },
      include: {
        case: {
          select: { title: true, caseNumber: true, courtName: true }
        }
      },
      orderBy: { hearingDate: 'asc' }
    });

    return successResponse(imminentHearings, "Imminent hearing alerts synchronized.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to recover judicial alerts.", error);
  }
}
