/**
 * Professional Client Directory API
 * Scope: Management of solicitor/client legal relationships.
 * Security: Session-verified, scoped to the authenticated lawyer.
 */

export const dynamic = 'force-dynamic';
import { getAuthContext } from "@/lib/auth-server";
import { createClient, getClients } from "@/lib/services/client.service";
import { clientSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import { logger } from "@/lib/services/logger.service";

/**
 * GET Handler: Directory Retrieval
 * Recovers all clients associated with the practitioner's portfolio with pagination.
 */
export async function GET(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Electronic session expired or invalid.");

  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit")) || 50;
    const offset = Number(url.searchParams.get("offset")) || 0;

    const clients = await getClients(user.id, user.chamberId, limit, offset);
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
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED("Authorization required for client registry.");

  try {
    const body = await req.json();
    
    // 1. Script-Injection Sanitization (XSS Shield)
    const { sanitizeObject } = await import("@/lib/sanitizer");
    const sanitizedBody = sanitizeObject(body);

    // 2. Structural Validation (Zod)
    const validationResult = clientSchema.safeParse(sanitizedBody);
    if (!validationResult.success) {
      await logger.warn("Client creation failed Zod validation", { userId: user.id, errors: validationResult.error.issues });
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    // 3. Persistent Enrollment
    const client = await createClient(user.id, user.chamberId, validationResult.data);
    
    // Log mutation per Backend Spec
    await logger.info("New client enrolled", { 
      userId: user.id, 
      clientId: client.id 
    });

    return successResponse(client, "Client successfully enrolled in the professional directory.", 201);
  } catch (error: any) {
    await logger.error("A critical failure occurred while enrolling the client record.", error, { userId: user.id });
    return apiErrors.SERVER_ERROR("A critical failure occurred while enrolling the client record.", error);
  }
}
