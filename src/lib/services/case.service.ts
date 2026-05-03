import db from "@/lib/db";
import { revalidateTags } from "@/lib/optimizer";

/**
 * Professional Case Management Service
 * Handles data persistence, real-time cache revalidation, and complex legal relationship mapping.
 */

export interface CreateCaseData {
  title: string;
  caseNumber: string;
  courtName: string;
  judgeName?: string;
  clientId: string;
  description?: string;
}

/**
 * Creates a new legal case record.
 */
export const createCase = async (userId: string, chamberId: string | null, data: CreateCaseData) => {
  const newCase = await db.case.create({
    data: {
      ...data,
      userId,
      chamberId,
    },
    include: {
      client: true,
    },
  });

  await revalidateTags(["cases", "dashboard", `client:${data.clientId}`]);
  return newCase;
};

/**
 * Retrieves all cases owned by a specific practitioner or their chamber, with mandatory pagination.
 */
export const getCases = async (userId: string, chamberId: string | null, limit: number = 50, offset: number = 0) => {
  return await db.case.findMany({
    where: chamberId ? { chamberId } : { userId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
};

/**
 * Retrieves a single case with full relational depth.
 */
export const getCaseById = async (userId: string, chamberId: string | null, caseId: string) => {
  return await db.case.findFirst({
    where: { 
      id: caseId,
      OR: chamberId ? [{ chamberId }] : [{ userId }]
    },
    include: {
      client: true,
      hearings: { orderBy: { hearingDate: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });
};

/**
 * Updates an existing case record.
 */
export const updateCase = async (userId: string, chamberId: string | null, caseId: string, data: Partial<CreateCaseData> & { status?: string }) => {
  const updatedCase = await db.case.update({
    where: { 
      id: caseId,
      OR: chamberId ? [{ chamberId }] : [{ userId }]
    },
    data,
  });

  await revalidateTags(["cases", `case:${caseId}`, "dashboard"]);
  return updatedCase;
};

/**
 * Soft deletes a case by changing its status to CLOSED.
 */
export const deleteCase = async (userId: string, chamberId: string | null, caseId: string) => {
  const closedCase = await db.case.update({
    where: { 
      id: caseId,
      OR: chamberId ? [{ chamberId }] : [{ userId }]
    },
    data: { status: "CLOSED" }
  });

  await revalidateTags(["cases", "dashboard", `case:${caseId}`]);
  return closedCase;
};

/**
 * Dedicated status update helper for high-frequency state transitions.
 */
export const updateCaseStatus = async (userId: string, caseId: string, status: string) => {
  return await updateCase(userId, caseId, { status });
};
