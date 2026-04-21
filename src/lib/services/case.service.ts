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
 * @param userId - The ID of the lawyer initiating the record.
 * @param data - Professional case metadata.
 */
export const createCase = async (userId: string, data: CreateCaseData) => {
  const newCase = await db.case.create({
    data: {
      ...data,
      userId,
    },
    include: {
      client: true,
    },
  });

  // 🔥 Trigger optimizer for real-time UI updates
  await revalidateTags(["cases", "dashboard", `client:${data.clientId}`]);

  return newCase;
};

/**
 * Retrieves all cases owned by a specific practitioner.
 * @param userId - Requesting lawyer's unique identifier.
 */
export const getCases = async (userId: string) => {
  return await db.case.findMany({
    where: { userId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Retrieves a single case with full relational depth (Hearings, Notes, Payments).
 * @param userId - Scoped owner ID for privacy verification.
 * @param caseId - Target case identifier.
 */
export const getCaseById = async (userId: string, caseId: string) => {
  return await db.case.findFirst({
    where: { id: caseId, userId },
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
 * @param userId - Owner verification.
 * @param caseId - Target case.
 * @param data - Partial update payload.
 */
export const updateCase = async (userId: string, caseId: string, data: Partial<CreateCaseData> & { status?: string }) => {
  const updatedCase = await db.case.update({
    where: { id: caseId, userId },
    data,
  });

  // 🔥 Notify system of state change
  await revalidateTags(["cases", `case:${caseId}`, "dashboard"]);
  return updatedCase;
};

/**
 * Permanently removes a case record (Hard Delete).
 * @param userId - Owner verification.
 * @param caseId - Target case.
 */
export const deleteCase = async (userId: string, caseId: string) => {
  const deletedCase = await db.case.delete({
    where: { id: caseId, userId },
  });

  await revalidateTags(["cases", "dashboard"]);
  return deletedCase;
};

/**
 * Dedicated status update helper for high-frequency state transitions.
 */
export const updateCaseStatus = async (userId: string, caseId: string, status: string) => {
  return await updateCase(userId, caseId, { status });
};
