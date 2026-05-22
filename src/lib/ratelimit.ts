import db from "@/lib/db";

/**
 * Atomic Database-Backed Rate Limiter
 *
 * Uses a raw SQL UPSERT to atomically increment the counter.
 * The previous find-then-update pattern had a race condition where
 * two simultaneous requests could both read count=59 and both pass a limit of 60.
 *
 * This implementation is safe under concurrent load.
 */
export async function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60000
): Promise<{ success: boolean; remaining: number; resetAt?: Date }> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    // Atomic upsert: create if not exists, or increment if window is still valid,
    // or reset if window has expired — all in a single DB round-trip.
    await db.$executeRaw`
      INSERT INTO "RateLimit" (id, key, count, "resetAt", "updatedAt")
      VALUES (gen_random_uuid(), ${key}, 1, ${resetAt}, ${now})
      ON CONFLICT (key)
      DO UPDATE SET
        count = CASE
          WHEN "RateLimit"."resetAt" < ${now} THEN 1
          ELSE "RateLimit".count + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimit"."resetAt" < ${now} THEN ${resetAt}
          ELSE "RateLimit"."resetAt"
        END,
        "updatedAt" = ${now}
    `;

    const record = await db.rateLimit.findUnique({ where: { key } });

    if (!record) {
      // Shouldn't happen after the upsert, but fail open to not block legitimate traffic
      return { success: true, remaining: limit };
    }

    if (record.count > limit) {
      return { success: false, remaining: 0, resetAt: record.resetAt };
    }

    return { success: true, remaining: Math.max(0, limit - record.count) };
  } catch (error) {
    // Fail open on DB errors — rate limiter failure should not block legitimate traffic
    console.error("[RATE-LIMIT] Check failed, failing open:", error);
    return { success: true, remaining: limit };
  }
}
