import db from "@/lib/db";
import { revalidateTags } from "@/lib/optimizer";

/**
 * Professional Hearing Management Service
 * Manages chronological legal events, court sessions, and automated hearing reminders.
 */

export interface CreateHearingData {
  caseId: string;
  hearingDate: Date | string;
  nextDate?: Date | string;
  notes?: string;
}

/**
 * Schedules a new court hearing for a specific case.
 * @param userId - Requesting practitioner.
 * @param data - Hearing metadata including next date logic.
 */
export const createHearing = async (userId: string, data: CreateHearingData) => {
  // 1. Verify existence and ownership of the parent case
  const existingCase = await db.case.findFirst({
    where: { id: data.caseId, userId },
  });

  if (!existingCase) {
    throw new Error("Case not found or unauthorized access to record.");
  }

  const hearing = await db.hearing.create({
    data: {
      caseId: data.caseId,
      hearingDate: new Date(data.hearingDate),
      nextDate: data.nextDate ? new Date(data.nextDate) : null,
      notes: data.notes,
    },
  });

  // 2. Automated Trigger: Create a system reminder for the next hearing
  if (data.nextDate) {
    await db.reminder.create({
      data: {
        userId,
        caseId: data.caseId,
        title: `Upcoming: ${existingCase.title}`,
        remindAt: new Date(new Date(data.nextDate).getTime() - 1000 * 60 * 60 * 24), // 24 hours before
        status: "PENDING",
      },
    });
  }

  // 3. Real-time Synchronization
  await revalidateTags(["hearings", `case:${data.caseId}`, "dashboard"]);

  return hearing;
};

/**
 * Updates a specific hearing event.
 */
export const updateHearing = async (userId: string, hearingId: string, data: Partial<CreateHearingData>) => {
  // Verify ownership via the case relationship
  const targetHearing = await db.hearing.findFirst({
    where: { id: hearingId, case: { userId } },
  });

  if (!targetHearing) throw new Error("Hearing record not found or access denied.");

  const updatedHearing = await db.hearing.update({
    where: { id: hearingId },
    data: {
      ...data,
      hearingDate: data.hearingDate ? new Date(data.hearingDate) : undefined,
      nextDate: data.nextDate ? new Date(data.nextDate) : undefined,
    },
  });

  await revalidateTags(["hearings", `case:${targetHearing.caseId}`, "dashboard"]);
  return updatedHearing;
};

/**
 * Removes a hearing record from the timeline.
 */
export const deleteHearing = async (userId: string, hearingId: string) => {
  const targetHearing = await db.hearing.findFirst({
    where: { id: hearingId, case: { userId } },
  });

  if (!targetHearing) throw new Error("Hearing record not found or access denied.");

  const deletedHearing = await db.hearing.delete({
    where: { id: hearingId },
  });

  await revalidateTags(["hearings", `case:${targetHearing.caseId}`, "dashboard"]);
  return deletedHearing;
};
