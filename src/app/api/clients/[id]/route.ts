/**
 * Professional Client Detail API — Dynamic Route Handler
 * Scope: Single-record operations (Read, Update, Delete) for a specific client.
 * Security: Session-verified, ownership-scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthContext } from "@/lib/auth-server";
import { updateClient, deleteClient } from "@/lib/services/client.service";
import { clientUpdateSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET Handler: Single Client Record Retrieval
 * Fetches a client with their full caseload history.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const client = await db.client.findFirst({
      where: { 
        id, 
        OR: user.chamberId ? [{ chamberId: user.chamberId }] : [{ userId: user.id }]
      },
      include: { cases: { orderBy: { createdAt: "desc" } } },
    });
    if (!client) return apiErrors.NOT_FOUND("Client record not found in the directory.");
    return successResponse(client, "Client record retrieved successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to retrieve client record.", error);
  }
}

/**
 * PUT Handler: Client Profile Update
 * Updates contact and profile data for a specific client.
 */
export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const body = await req.json();

    const validationResult = clientUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    const updatedClient = await updateClient(user.id, user.chamberId, id, validationResult.data);
    return successResponse(updatedClient, "Client profile updated successfully.");
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    if (err.code === "P2025") return apiErrors.NOT_FOUND("Client record not found or not authorized.");
    return apiErrors.SERVER_ERROR("Failed to update client record.", error);
  }
}

/**
 * DELETE Handler: Client Registry Removal
 * Permanently removes the client from the professional directory.
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id } = await params;
  try {
    const deletedClient = await deleteClient(user.id, id);
    return successResponse(deletedClient, "Client permanently removed from the professional directory.");
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    if (err.code === "P2025") return apiErrors.NOT_FOUND("Client record not found or not authorized.");
    return apiErrors.SERVER_ERROR("Failed to remove client record.", error);
  }
}
