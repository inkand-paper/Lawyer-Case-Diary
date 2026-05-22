import db from "@/lib/db";
import { revalidateTags } from "@/lib/optimizer";

/**
 * Professional Note Management Service
 */

export const createNote = async (userId: string, chamberId: string | null, caseId: string, content: string) => {
  // Verify case ownership/access first
  const caseRecord = await db.case.findFirst({
    where: { 
      id: caseId,
      OR: chamberId ? [{ chamberId }] : [{ userId }]
    }
  });

  if (!caseRecord) throw new Error("Case not found or access denied.");

  const note = await db.note.create({
    data: {
      caseId,
      content
    }
  });

  await revalidateTags([`case:${caseId}`]);
  return note;
};

export const deleteNote = async (userId: string, chamberId: string | null, caseId: string, noteId: string) => {
  // Verify case ownership/access
  const caseRecord = await db.case.findFirst({
    where: { 
      id: caseId,
      OR: chamberId ? [{ chamberId }] : [{ userId }]
    }
  });

  if (!caseRecord) throw new Error("Case not found or access denied.");

  const deletedNote = await db.note.delete({
    where: { id: noteId, caseId }
  });

  await revalidateTags([`case:${caseId}`]);
  return deletedNote;
};

export const updateNote = async (userId: string, chamberId: string | null, caseId: string, noteId: string, content: string) => {
  // Verify case ownership/access
  const caseRecord = await db.case.findFirst({
    where: { 
      id: caseId,
      OR: chamberId ? [{ chamberId }] : [{ userId }]
    }
  });

  if (!caseRecord) throw new Error("Case not found or access denied.");

  const updatedNote = await db.note.update({
    where: { id: noteId, caseId },
    data: { content }
  });

  await revalidateTags([`case:${caseId}`]);
  return updatedNote;
};
