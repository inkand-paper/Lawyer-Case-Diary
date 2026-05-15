import db from "@/lib/db";
import { apiErrors } from "@/lib/api-response";

/**
 * Professional Subscription & Plan Enforcement Service
 * SOLID Principle: Single Responsibility (S)
 * Centralizes all business logic related to plan limitations.
 */

export const PLAN_LIMITS = {
  ESSENTIAL: {
    maxCases: 50,
    maxClients: 20,
    teamAccess: false,
    analytics: false,
  },
  ULTIMATE: {
    maxCases: Infinity,
    maxClients: Infinity,
    teamAccess: true,
    analytics: true,
  }
};

/**
 * Validates if the user can create another case.
 */
export async function checkCaseLimit(userId: string, plan: string) {
  if (plan === "ULTIMATE") return true;

  const limit = PLAN_LIMITS.ESSENTIAL.maxCases;
  const count = await db.case.count({ where: { userId } });

  if (count >= limit) {
    throw new Error(`Plan Limit Exceeded: Your ${plan} plan only allows ${limit} cases. Please upgrade to ULTIMATE.`);
  }

  return true;
}

/**
 * Validates if the user can create another client.
 */
export async function checkClientLimit(userId: string, plan: string) {
  if (plan === "ULTIMATE") return true;

  const limit = PLAN_LIMITS.ESSENTIAL.maxClients;
  const count = await db.client.count({ where: { userId } });

  if (count >= limit) {
    throw new Error(`Plan Limit Exceeded: Your ${plan} plan only allows ${limit} clients. Please upgrade to ULTIMATE.`);
  }

  return true;
}
