import { getAuthContext } from "@/lib/auth-server";
import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

const documentSchema = z.object({
  name: z.string().min(1).max(500),
  fileUrl: z.string().url("A valid file URL is required."),
  size: z.number().int().positive().max(100 * 1024 * 1024, "File size cannot exceed 100MB."),
  type: z.string().min(1).max(100),
});

export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id: caseId } = await params;

  // Verify case access before returning documents
  const caseRecord = await db.case.findFirst({
    where: {
      id: caseId,
      OR: user.chamberId ? [{ chamberId: user.chamberId }, { userId: user.id }] : [{ userId: user.id }],
    },
  });

  if (!caseRecord) return apiErrors.NOT_FOUND("Case not found or access denied.");

  const documents = await db.document.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(documents, "Documents retrieved successfully.");
}

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  try {
    const { id: caseId } = await params;

    // Verify case access
    const caseRecord = await db.case.findFirst({
      where: {
        id: caseId,
        OR: user.chamberId ? [{ chamberId: user.chamberId }, { userId: user.id }] : [{ userId: user.id }],
      },
    });

    if (!caseRecord) return apiErrors.NOT_FOUND("Case not found or access denied.");

    const body = await req.json();
    const validation = documentSchema.safeParse(body);
    if (!validation.success) {
      return apiErrors.BAD_REQUEST(validation.error.issues[0].message);
    }

    const document = await db.document.create({
      data: {
        caseId,
        name: validation.data.name,
        fileUrl: validation.data.fileUrl,
        size: validation.data.size,
        type: validation.data.type,
      },
    });

    return successResponse(document, "Document recorded successfully.", 201);
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to record document.", error);
  }
}
