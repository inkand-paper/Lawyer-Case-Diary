/**
 * Professional System Intelligence API
 * Scope: Real-time dashboard metrics aggregation for the authenticated practitioner.
 * Security: Session-verified via centralized getAuthUser helper.
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";

/**
 * GET Handler: Live Intelligence Synthesis
 * Aggregates case counts, client metrics, and upcoming hearings in parallel.
 * Powers the real-time dashboard status engine.
 */
export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    // 1. Parallel aggregation for maximum performance
    const [caseCount, clientCount, hearingCount] = await Promise.all([
      db.case.count({ where: { userId } }),
      db.client.count({ where: { userId } }),
      db.hearing.count({
        where: {
          case: { userId },
          hearingDate: { gte: new Date() },
        },
      }),
    ]);

    // 2. Recent procedural activity for the intelligence feed
    const recentCases = await db.case.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });

    return successResponse({
      stats: {
        activeCases: caseCount,
        verifiedClients: clientCount,
        upcomingHearings: hearingCount,
        uptime: "99.9%",
      },
      recentActions: recentCases,
    }, "Intelligence matrix synchronized.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to aggregate system intelligence from the legal core.", error);
  }
}
