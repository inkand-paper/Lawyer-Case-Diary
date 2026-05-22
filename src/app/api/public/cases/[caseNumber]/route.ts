import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ caseNumber: string }> }
) {
  try {
    const { caseNumber } = await params;
    
    // Public endpoint so do not check auth, but limit fields heavily
    const caseData = await db.case.findFirst({
      where: { caseNumber },
      select: {
        title: true,
        caseNumber: true,
        courtName: true,
        status: true,
        hearings: {
          select: {
            hearingDate: true,
            nextDate: true,
            // SECURITY FIX: Never expose private hearing notes to unauthenticated users
          },
          orderBy: { hearingDate: 'desc' },
          take: 5
        }
      }
    });

    if (!caseData) return apiErrors.NOT_FOUND("Case not found");

    return successResponse(caseData, "Public case details retrieved.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to fetch public case", error);
  }
}
