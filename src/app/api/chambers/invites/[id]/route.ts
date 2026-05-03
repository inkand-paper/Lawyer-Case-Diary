import { getAuthContext } from "@/lib/auth-server";
import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";
import { logger } from "@/lib/services/logger.service";

export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH: Accept or Decline Invitation
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  const { action } = await req.json(); // "ACCEPT" or "DECLINE"

  try {
    const invite = await db.invitation.findUnique({
      where: { id }
    });

    if (!invite || invite.email !== user.email || invite.status !== "PENDING") {
      return apiErrors.NOT_FOUND("Invitation not found or already processed.");
    }

    if (action === "ACCEPT") {
      // Atomic Join
      await db.$transaction([
        db.invitation.update({
          where: { id },
          data: { status: "ACCEPTED" }
        }),
        db.user.update({
          where: { id: user.id },
          data: { chamberId: invite.chamberId }
        })
      ]);

      await logger.info("Chamber invitation accepted", { userId: user.id, chamberId: invite.chamberId });
      return successResponse(null, "You have joined the Chamber.");
    } else {
      await db.invitation.update({
        where: { id },
        data: { status: "DECLINED" }
      });
      return successResponse(null, "Invitation declined.");
    }
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to process invitation action.", error);
  }
}
