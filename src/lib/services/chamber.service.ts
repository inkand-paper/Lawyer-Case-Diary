import db from "@/lib/db";
import { logger } from "./logger.service";

/**
 * Professional Chamber Management Service
 * SOLID Principle: Single Responsibility
 * Handles the lifecycle of legal chambers and practitioner affiliations.
 */

export const createChamber = async (userId: string, name: string) => {
  const chamber = await db.$transaction(async (tx) => {
    // 1. Create Chamber
    const newChamber = await tx.chamber.create({
      data: {
        name,
        ownerId: userId,
        members: {
          connect: { id: userId }
        }
      }
    });

    // 2. Link owner to chamber
    await tx.user.update({
      where: { id: userId },
      data: { chamberId: newChamber.id }
    });

    return newChamber;
  });

  await logger.info("Chamber Ecosystem Initialized", { userId, chamberId: chamber.id, name });
  return chamber;
};

export const getChamberContext = async (chamberId: string) => {
  return await db.chamber.findUnique({
    where: { id: chamberId },
    include: {
      members: {
        select: { id: true, name: true, email: true, role: true }
      },
      invites: {
        where: { status: "PENDING" }
      },
      cases: {
        select: { id: true, title: true, caseNumber: true, status: true, client: { select: { name: true } } }
      }
    }
  });
};
