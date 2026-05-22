import { getAuthUser } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

/**
 * GET api/reminders
 * Fetches pending reminders for the authenticated user.
 */
export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Unauthorized");

  try {
    const reminders = await db.reminder.findMany({
      where: { userId },
      orderBy: { remindAt: 'asc' }
    });

    return successResponse(reminders, "Reminders synchronized.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to fetch reminders", error);
  }
}
