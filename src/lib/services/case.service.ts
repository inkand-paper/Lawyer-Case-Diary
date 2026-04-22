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

  await revalidateTags(["cases", "dashboard", `client:${data.clientId}`]);
  return newCase;
};

/**
 * Retrieves all cases owned by a specific practitioner.
 */
export const getCases = async (userId: string) => {
  return await db.case.findMany({
    where: { userId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Retrieves a single case with full relational depth.
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
 */
export const updateCase = async (userId: string, caseId: string, data: Partial<CreateCaseData> & { status?: string }) => {
  const updatedCase = await db.case.update({
    where: { id: caseId, userId },
    data,
  });

  await revalidateTags(["cases", `case:${caseId}`, "dashboard"]);
  return updatedCase;
};

/**
 * Permanently removes a case record (Hard Delete).
 * ─────────────────────────────────────────────────────────────
 * SAFETY: Implements manual cascading deletes for all associated 
 * hearings, notes, and payments to prevent FK violations.
 * ─────────────────────────────────────────────────────────────
 */
export const deleteCase = async (userId: string, caseId: string) => {
  return await db.$transaction(async (tx) => {
    // 1. Delete all associated sub-records
    await tx.hearing.deleteMany({ where: { caseId } });
    await tx.note.deleteMany({ where: { caseId } });
    await tx.payment.deleteMany({ where: { caseId } });
    await tx.reminder.deleteMany({ where: { caseId } });

    // 2. Delete the primary case record
    const deletedCase = await tx.case.delete({
      where: { id: caseId, userId },
    });

    await revalidateTags(["cases", "dashboard"]);
    return deletedCase;
  });
};

/**
 * Dedicated status update helper for high-frequency state transitions.
 */
export const updateCaseStatus = async (userId: string, caseId: string, status: string) => {
  return await updateCase(userId, caseId, { status });
};
