import db from "@/lib/db";
import { revalidateTags } from "@/lib/optimizer";
import { logger } from "./logger.service";

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
 * Verifies the client belongs to the lawyer/chamber before creating.
 */
export const createCase = async (userId: string, chamberId: string | null, data: CreateCaseData) => {
  // Verify the client belongs to this user/chamber to prevent cross-lawyer case assignment
  const client = await db.client.findFirst({
    where: {
      id: data.clientId,
      OR: chamberId ? [{ chamberId }, { userId }] : [{ userId }],
    },
  });

  if (!client) {
    throw new Error("Client not found or access denied.");
  }

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

  logger.info("Case Record Created", { userId, caseId: newCase.id, title: data.title });
  revalidateTags(["cases", "dashboard", `client:${data.clientId}`]);
  return newCase;
};

/**
 * Retrieves all cases owned by a specific practitioner or their chamber, with mandatory pagination.
 *
 * FIX: Previously, adding a `search` filter overwrote the ownership OR clause,
 * leaking other lawyers' data. Now uses AND to combine all filters safely.
 */
export const getCases = async (
  userId: string,
  chamberId: string | null,
  limit: number = 50,
  offset: number = 0,
  search?: string,
  status?: string
) => {
  // Build filters as AND clauses to prevent one filter from overwriting another
  const andClauses: object[] = [
    chamberId
      ? { OR: [{ chamberId }, { userId }] }
      : { userId },
  ];

  if (status) {
    andClauses.push({ status });
  }

  if (search) {
    andClauses.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { caseNumber: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return await db.case.findMany({
    where: { AND: andClauses },
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
  const caseRecord = await db.case.findFirst({
    where: {
      id: caseId,
      OR: chamberId ? [{ chamberId }, { userId }] : [{ userId }],
    },
    include: {
      client: true,
      hearings: { orderBy: { hearingDate: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });

  if (caseRecord) {
    // Fire-and-forget — access log doesn't need to block the response
    logger.info("Sensitive Case Record Accessed", { userId, caseId, caseNumber: caseRecord.caseNumber });
  }

  return caseRecord;
};

/**
 * Updates an existing case record.
 */
export const updateCase = async (
  userId: string,
  chamberId: string | null,
  caseId: string,
  data: Partial<CreateCaseData> & { status?: string }
) => {
  const updatedCase = await db.case.update({
    where: {
      id: caseId,
      OR: chamberId ? [{ chamberId }, { userId }] : [{ userId }],
    },
    data,
  });

  logger.info("Case Record Updated", { userId, caseId, updates: Object.keys(data) });
  revalidateTags(["cases", `case:${caseId}`, "dashboard"]);
  return updatedCase;
};

/**
 * Soft deletes a case by changing its status to CLOSED.
 */
export const deleteCase = async (userId: string, chamberId: string | null, caseId: string) => {
  const closedCase = await db.case.update({
    where: {
      id: caseId,
      OR: chamberId ? [{ chamberId }, { userId }] : [{ userId }],
    },
    data: { status: "CLOSED" },
  });

  logger.warn("Case Record Deactivated (Soft Delete)", { userId, caseId });
  revalidateTags(["cases", "dashboard", `case:${caseId}`]);
  return closedCase;
};

/**
 * Dedicated status update helper for high-frequency state transitions.
 */
export const updateCaseStatus = async (
  userId: string,
  chamberId: string | null,
  caseId: string,
  status: string
) => {
  return await updateCase(userId, chamberId, caseId, { status });
};
