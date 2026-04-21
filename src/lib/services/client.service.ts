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
 */
export const deleteClient = async (userId: string, clientId: string) => {
  const deletedClient = await db.client.delete({
    where: { id: clientId, userId },
  });

  await revalidateTags(["clients", "dashboard"]);
  return deletedClient;
};
