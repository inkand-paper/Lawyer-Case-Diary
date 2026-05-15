/**
 * Professional Client Directory API
 * Scope: Management of solicitor/client legal relationships.
 * Security: Session-verified, scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthContext } from "@/lib/auth-server";
import { createClient, getClients } from "@/lib/services/client.service";
import { checkClientLimit } from "@/lib/services/plan.service";
import { clientSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import { logger } from "@/lib/services/logger.service";
import { validateRequest } from "@/lib/request-handler";
import { getPagination } from "@/lib/pagination";

/**
 * GET Handler: Directory Retrieval
 */
export async function GET(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const { limit, offset } = getPagination(req.url);

    const clients = await getClients(user.id, user.chamberId, limit, offset);
    return successResponse(clients, "Client directory synchronized successfully.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to recover client data from the legal core.", error);
  }
}

/**
 * POST Handler: New Client Registry
 */
export async function POST(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Authorization required for client registry.");

  // 1. Unified Validation & Sanitization (SOLID: S)
  const validation = await validateRequest(req, clientSchema);
  if (!validation.success) {
    return apiErrors.BAD_REQUEST(validation.error);
  }

  try {
    // 2. Plan Limit Enforcement (SOLID: S)
    await checkClientLimit(user.id, user.plan);

    // 3. Persistent Enrollment
    const client = await createClient(user.id, user.chamberId, validation.data);
    
    return successResponse(client, "Client successfully enrolled in the professional directory.", 201);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isPlanLimit = errorMsg.includes("Plan Limit");
    const message = isPlanLimit ? errorMsg : "A critical failure occurred while enrolling the client record.";
      
    await logger.error(message, error, { userId: user.id });
    
    return isPlanLimit
      ? apiErrors.FORBIDDEN(message)
      : apiErrors.SERVER_ERROR(message, error);
  }
}
