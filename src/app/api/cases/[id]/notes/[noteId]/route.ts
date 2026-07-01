import { getAuthContext } from "@/lib/auth-server";
import { updateNote, deleteNote } from "@/lib/services/note.service";
import { successResponse, apiErrors } from "@/lib/api-response";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().min(1, "Note content cannot be empty.")
});

type RouteParams = { params: Promise<{ id: string, noteId: string }> };

export async function PATCH(req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id: caseId, noteId } = await params;
  try {
    const body = await req.json();
    const validation = noteSchema.safeParse(body);
    if (!validation.success) {
      return apiErrors.BAD_REQUEST(validation.error.issues[0].message);
    }

    const note = await updateNote(user.id, user.chamberId, caseId, noteId, validation.data.content);
    return successResponse(note, "Case note updated successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update case note.";
    return apiErrors.SERVER_ERROR(message, error);
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id: caseId, noteId } = await params;
  try {
    const note = await deleteNote(user.id, user.chamberId, caseId, noteId);
    return successResponse(note, "Case note removed from registry.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to remove case note.";
    return apiErrors.SERVER_ERROR(message, error);
  }
}
