import db from "@/lib/db";
import { revalidateTags } from "@/lib/optimizer";

/**
 * Professional Client Management Service
 * Handles solicitor/client relationship tracking and legal contact metadata.
 */

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Registers a new client in the system.
 * @param userId - Owner practitioner ID.
 * @param data - Client's personal/legal contact info.
 */
export const createClient = async (userId: string, data: CreateClientData) => {
  const client = await db.client.create({
    data: {
      ...data,
      userId,
    },
  });

  await revalidateTags(["clients", "dashboard"]);
  return client;
};

/**
 * Retrieves the full client directory for a specific lawyer.
 */
export const getClients = async (userId: string) => {
  return await db.client.findMany({
    where: { userId },
    include: {
      _count: { select: { cases: true } }
    },
    orderBy: { name: "asc" },
  });
};

/**
 * Updates an existing client's contact information.
 */
export const updateClient = async (userId: string, clientId: string, data: Partial<CreateClientData>) => {
  const updatedClient = await db.client.update({
    where: { id: clientId, userId },
    data,
  });

  await revalidateTags(["clients", `client:${clientId}`, "dashboard"]);
  return updatedClient;
};

/**
 * Removes a client record from the registry.
 * ─────────────────────────────────────────────────────────────
 * SAFETY: Implements manual cascading deletes for all associated 
 * cases, hearings, notes, and payments to prevent FK violations.
 * ─────────────────────────────────────────────────────────────
 */
export const deleteClient = async (userId: string, clientId: string) => {
  return await db.$transaction(async (tx) => {
    // 1. Recover all case IDs belonging to this client and user
    const clientCases = await tx.case.findMany({
      where: { clientId, userId },
      select: { id: true }
    });
    
    const caseIds = clientCases.map(c => c.id);

    if (caseIds.length > 0) {
      // 2. Clear all nested dependencies for these cases
      await tx.hearing.deleteMany({ where: { caseId: { in: caseIds } } });
      await tx.note.deleteMany({ where: { caseId: { in: caseIds } } });
      await tx.payment.deleteMany({ where: { caseId: { in: caseIds } } });
      await tx.reminder.deleteMany({ where: { caseId: { in: caseIds } } });

      // 3. Delete the cases themselves
      await tx.case.deleteMany({ where: { id: { in: caseIds }, userId } });
    }

    // 4. Finally, delete the client entity
    const deletedClient = await tx.client.delete({
      where: { id: clientId, userId },
    });

    await revalidateTags(["clients", "cases", "dashboard"]);
    return deletedClient;
  });
};
