/**
 * Professional Client Directory API
 * Scope: Management of solicitor/client legal relationships.
 * Security: Session-verified, scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import { createClient, getClients } from "@/lib/services/client.service";
import { clientSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";

/**
 * GET Handler: Directory Retrieval
 * Recovers all clients associated with the practitioner's portfolio.
 */
export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const clients = await getClients(userId);
    return successResponse(clients, "Client directory synchronized successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to recover client data from the legal core.", error);
  }
}

/**
 * POST Handler: New Client Registry
 * Enrolls a new client entity into the professional directory.
 */
export async function POST(req: Request) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED("Authorization required for client registry.");

  try {
    const body = await req.json();
    
    // 1. Structural Validation (Zod)
    const validationResult = clientSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    // 2. Persistent Enrollment
    const client = await createClient(userId, validationResult.data);
    return successResponse(client, "Client successfully enrolled in the professional directory.", 201);
  } catch (error: any) {
    return apiErrors.SERVER_ERROR("A critical failure occurred while enrolling the client record.", error);
  }
}
