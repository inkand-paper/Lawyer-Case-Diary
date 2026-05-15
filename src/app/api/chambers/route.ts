import { getAuthContext } from "@/lib/auth-server";
import { successResponse, apiErrors } from "@/lib/api-response";
import { chamberSchema } from "@/lib/validators";
import { validateRequest } from "@/lib/request-handler";
import { createChamber, getChamberContext } from "@/lib/services/chamber.service";

/**
 * GET: Retrieve Chamber context
 */
export async function GET() {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  if (!user.chamberId) {
    return successResponse(null, "User is not part of a chamber.");
  }

  const chamber = await getChamberContext(user.chamberId);
  return successResponse(chamber, "Chamber data synchronized.");
}

/**
 * POST: Initialize a new Chamber
 */
export async function POST(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  // Policy Enforcement (SOLID: S)
  if (user.plan !== "ULTIMATE" && user.role !== "ADMIN") {
    return apiErrors.FORBIDDEN("Shared Chambers are a Premium feature. Please upgrade to unlock team collaboration.");
  }

  if (user.chamberId) {
    return apiErrors.BAD_REQUEST("You are already associated with a Chamber.");
  }

  // 1. Validation & Sanitization
  const validation = await validateRequest(req, chamberSchema);
  if (!validation.success) {
    return apiErrors.BAD_REQUEST(validation.error);
  }

  try {
    // 2. Service-level Execution
    const chamber = await createChamber(user.id, validation.data.name);
    return successResponse(chamber, "Chamber created successfully.", 201);
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to initialize Chamber.", error);
  }
}
