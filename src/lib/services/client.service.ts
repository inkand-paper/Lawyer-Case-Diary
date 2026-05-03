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
 */
export const createClient = async (userId: string, chamberId: string | null, data: CreateClientData) => {
  const client = await db.client.create({
    data: {
      ...data,
      userId,
      chamberId,
    },
  });

  await revalidateTags(["clients", "dashboard"]);
  return client;
};

/**
 * Retrieves the full client directory for a specific lawyer or their chamber, with mandatory pagination.
 */
export const getClients = async (userId: string, chamberId: string | null, limit: number = 50, offset: number = 0) => {
  return await db.client.findMany({
    where: chamberId ? { chamberId } : { userId },
    include: {
      _count: { select: { cases: true } }
    },
    orderBy: { name: "asc" },
    take: limit,
    skip: offset,
  });
};

/**
 * Updates an existing client's contact information.
 */
export const updateClient = async (userId: string, chamberId: string | null, clientId: string, data: Partial<CreateClientData>) => {
  const updatedClient = await db.client.update({
    where: { 
      id: clientId,
      OR: chamberId ? [{ chamberId }] : [{ userId }]
    },
    data,
  });

  await revalidateTags(["clients", `client:${clientId}`, "dashboard"]);
  return updatedClient;
};

/**
 * Removes a client record from the registry.
 * ─────────────────────────────────────────────────────────────
 * SAFETY: Enforces the Backend Engineering Spec to never hard-delete
 * critical legal data. Throws a policy error instead.
 * ─────────────────────────────────────────────────────────────
 */
export const deleteClient = async (_userId: string, _clientId: string) => {
  // Enforcing Backend Spec: Never hard-delete clients.
  throw new Error("Hard deleting clients is prohibited by system policy. Please retain the client record for legal compliance and close their associated cases instead.");
};
