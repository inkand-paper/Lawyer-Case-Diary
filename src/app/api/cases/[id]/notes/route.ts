import { getAuthContext } from "@/lib/auth-server";
import { createNote } from "@/lib/services/note.service";
import { successResponse, apiErrors } from "@/lib/api-response";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().min(1, "Note content cannot be empty.")
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id: caseId } = await params;
  try {
    const body = await req.json();
    const validation = noteSchema.safeParse(body);
    if (!validation.success) {
      return apiErrors.BAD_REQUEST(validation.error.issues[0].message);
    }

    const note = await createNote(user.id, user.chamberId, caseId, validation.data.content);
    return successResponse(note, "Case note recorded successfully.", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record case note.";
    return apiErrors.SERVER_ERROR(message, error);
  }
}
