/**
 * API Key Management Terminal
 * Scope: Generate and revoke permanent access keys for external integrations (Android/iOS).
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";
import { generateApiKey, revokeApiKey } from "@/lib/services/auth.service";

export async function GET() {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  try {
    const keys = await db.apiKey.findMany({
      where: { userId },
      select: { id: true, name: true, createdAt: true, lastUsedAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(keys, "Registry keys recovered.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to recover registry keys.", error);
  }
}

export async function POST(req: Request) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  try {
    const { name } = await req.json();
    if (!name) return apiErrors.BAD_REQUEST("Key label required.");

    const keyData = await generateApiKey(userId, name);
    return successResponse(keyData, "New registry key generated.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Key generation failed.", error);
  }
}

export async function DELETE(req: Request) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  try {
    const { id } = await req.json();
    await revokeApiKey(userId, id);
    return successResponse(null, "Key revoked.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Key revocation failed.", error);
  }
}
