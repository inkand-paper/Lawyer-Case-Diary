import db from "@/lib/db";
import { apiErrors } from "@/lib/api-response";

/**
 * Professional Subscription & Plan Enforcement Service
 * SOLID Principle: Single Responsibility (S)
 * Centralizes all business logic related to plan limitations.
 */

export const PLAN_LIMITS = {
  FREE: {
    maxCases: 5,
    maxClients: 3,
    teamAccess: false,
    analytics: false,
  },
  ESSENTIAL: {
    maxCases: 50,
    maxClients: 20,
    teamAccess: false,
    analytics: false,
  },
  EXECUTIVE: {
    maxCases: 200,
    maxClients: 100,
    teamAccess: true,
    analytics: false,
  },
  ULTIMATE: {
    maxCases: Infinity,
    maxClients: Infinity,
    teamAccess: true,
    analytics: true,
  },
} as const;

type PlanName = keyof typeof PLAN_LIMITS;

function getLimits(plan: string) {
  if (plan in PLAN_LIMITS) {
    return PLAN_LIMITS[plan as PlanName];
  }
  // Unknown plans get the most restrictive limits instead of silently passing through
  console.warn(`[PLAN] Unknown plan "${plan}" — applying ESSENTIAL limits.`);
  return PLAN_LIMITS.ESSENTIAL;
}

/**
 * Validates if the user can create another case.
 */
export async function checkCaseLimit(userId: string, plan: string) {
  const limits = getLimits(plan);
  if (limits.maxCases === Infinity) return true;

  const count = await db.case.count({ where: { userId } });

  if (count >= limits.maxCases) {
    throw new Error(
      `Plan Limit Exceeded: Your ${plan} plan allows up to ${limits.maxCases} cases. Please upgrade to unlock more.`
    );
  }

  return true;
}

/**
 * Validates if the user can create another client.
 */
export async function checkClientLimit(userId: string, plan: string) {
  const limits = getLimits(plan);
  if (limits.maxClients === Infinity) return true;

  const count = await db.client.count({ where: { userId } });

  if (count >= limits.maxClients) {
    throw new Error(
      `Plan Limit Exceeded: Your ${plan} plan allows up to ${limits.maxClients} clients. Please upgrade to unlock more.`
    );
  }

  return true;
}
