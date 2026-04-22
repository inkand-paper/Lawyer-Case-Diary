/**
 * API Key Management Terminal
 * Scope: Generate and revoke permanent access keys for external integrations (Android/iOS).
 */

export const dynamic = 'force-dynamic';
import { getAuthUser } from "@/lib/auth-server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";
import crypto from "crypto";

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
    return apiErrors.SERVER_ERROR("Failed to recover registry keys.");
  }
}

export async function POST(req: Request) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  try {
    const { name } = await req.json();
    if (!name) return apiErrors.BAD_REQUEST("Key label required.");

    // Generate a secure random key
    const rawKey = `lcd_${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const newKey = await db.apiKey.create({
      data: {
        userId,
        name,
        keyHash
      }
    });

    // We only return the rawKey ONCE
    return successResponse({ ...newKey, rawKey }, "New registry key generated.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Key generation failed.");
  }
}

export async function DELETE(req: Request) {
  const userId = await getAuthUser();
  if (!userId) return apiErrors.UNAUTHORIZED();

  try {
    const { id } = await req.json();
    await db.apiKey.delete({ where: { id, userId } });
    return successResponse(null, "Key revoked.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Key revocation failed.");
  }
}
