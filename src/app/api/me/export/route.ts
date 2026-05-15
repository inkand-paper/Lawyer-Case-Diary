import { getAuthContext } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";
import { logger } from "@/lib/services/logger.service";

/**
 * GDPR RIGHT TO DATA PORTABILITY (Article 20)
 * Allows a user to download all their personal data in a machine-readable format.
 */
export async function GET() {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Authentication required for data export.");

  try {
    const data = await db.user.findUnique({
      where: { id: user.id },
      include: {
        clients: true,
        cases: {
          include: {
            hearings: true,
            notes: true,
            payments: true
          }
        },
        chamber: true
      }
    });

    await logger.info("GDPR Data Export Triggered", { userId: user.id });

    return successResponse(data, "Personal data archive generated successfully.");
  } catch (error) {
    await logger.error("GDPR Export Failure", error, { userId: user.id });
    return apiErrors.SERVER_ERROR("Failed to generate data archive.", error);
  }
}
