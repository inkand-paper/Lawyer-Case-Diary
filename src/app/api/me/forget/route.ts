import { getAuthContext } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";
import { logger } from "@/lib/services/logger.service";

/**
 * GDPR RIGHT TO ERASURE (Article 17)
 * "Right to be Forgotten" — Permanently deletes all user data.
 * This is IRREVERSIBLE.
 */
export async function DELETE() {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Authentication required for account erasure.");

  try {
    // 1. Log the intent before starting (Audit Trail)
    await logger.warn("GDPR Right to Erasure Initiated", { userId: user.id });

    // 2. Cascade delete will handle related records if defined in Prisma
    // If not, we do it manually or via transaction
    await db.$transaction([
      db.hearing.deleteMany({ where: { case: { userId: user.id } } }),
      db.note.deleteMany({ where: { case: { userId: user.id } } }),
      db.payment.deleteMany({ where: { case: { userId: user.id } } }),
      db.case.deleteMany({ where: { userId: user.id } }),
      db.client.deleteMany({ where: { userId: user.id } }),
      db.apiKey.deleteMany({ where: { userId: user.id } }),
      db.user.delete({ where: { id: user.id } })
    ]);

    return successResponse(null, "Account and all associated records permanently erased.");
  } catch (error) {
    await logger.error("GDPR Erasure Failure", error, { userId: user.id });
    return apiErrors.SERVER_ERROR("Failed to process account erasure.", error);
  }
}
