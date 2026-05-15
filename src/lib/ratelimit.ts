import db from "@/lib/db";

/**
 * Production Rate Limiter (Database-Backed)
 * Prevents API abuse by limiting requests per IP/User.
 * Default: 60 requests per minute.
 */

export async function checkRateLimit(key: string, limit = 60, windowMs = 60000) {
  const now = new Date();
  
  const record = await db.rateLimit.findUnique({
    where: { key }
  });

  if (!record) {
    await db.rateLimit.create({
      data: {
        key,
        count: 1,
        resetAt: new Date(now.getTime() + windowMs)
      }
    });
    return { success: true, remaining: limit - 1 };
  }

  // Check if window expired
  if (now > record.resetAt) {
    await db.rateLimit.update({
      where: { key },
      data: {
        count: 1,
        resetAt: new Date(now.getTime() + windowMs)
      }
    });
    return { success: true, remaining: limit - 1 };
  }

  // Check limit
  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment count
  await db.rateLimit.update({
    where: { key },
    data: {
      count: { increment: 1 }
    }
  });

  return { success: true, remaining: limit - (record.count + 1) };
}
