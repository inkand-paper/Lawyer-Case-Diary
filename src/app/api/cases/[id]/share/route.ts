import db from "@/lib/db";
import { getAuthContext } from "@/lib/auth-server";
import { successResponse, apiErrors } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();
  
  if (!user.chamberId) {
    return apiErrors.FORBIDDEN("You must be part of a chamber to share a case.");
  }

  try {
    const caseRecord = await db.case.findUnique({
      where: { id: p.id },
      select: { userId: true, chamberId: true }
    });

    if (!caseRecord) {
      return apiErrors.NOT_FOUND("Case not found.");
    }

    if (caseRecord.userId !== user.id) {
      return apiErrors.FORBIDDEN("Only the owner can share this case.");
    }

    if (caseRecord.chamberId === user.chamberId) {
      return apiErrors.BAD_REQUEST("Case is already shared with the chamber.");
    }

    const updatedCase = await db.case.update({
      where: { id: p.id },
      data: { chamberId: user.chamberId }
    });

    return successResponse(updatedCase, "Case successfully shared with your Chamber.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to share case.", error);
  }
}
