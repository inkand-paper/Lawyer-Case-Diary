import { getAuthContext } from "@/lib/auth-server";
import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";
import { chamberSchema } from "@/lib/validators";
import { logger } from "@/lib/services/logger.service";

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieve Chamber context
 */
export async function GET() {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  if (!user.chamberId) {
    return successResponse(null, "User is not part of a chamber.");
  }

  const chamber = await db.chamber.findUnique({
    where: { id: user.chamberId },
    include: {
      members: {
        select: { id: true, name: true, email: true, role: true }
      },
      invites: {
        where: { status: "PENDING" }
      }
    }
  });

  return successResponse(chamber, "Chamber data synchronized.");
}

/**
 * POST: Initialize a new Chamber
 */
export async function POST(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  // Policy: Only Premium (Ultimate) or Admin can create Chambers
  if (user.plan !== "ULTIMATE" && user.role !== "ADMIN") {
    return apiErrors.FORBIDDEN("Shared Chambers are a Premium feature. Please upgrade to unlock team collaboration.");
  }

  // Policy: User cannot own more than one chamber
  if (user.chamberId) {
    return apiErrors.BAD_REQUEST("You are already associated with a Chamber.");
  }

  try {
    const body = await req.json();
    const validation = chamberSchema.safeParse(body);
    if (!validation.success) {
      return apiErrors.BAD_REQUEST(validation.error.issues[0].message);
    }

    // Atomic Creation
    const chamber = await db.$transaction(async (tx) => {
      const newChamber = await tx.chamber.create({
        data: {
          name: validation.data.name,
          ownerId: user.id,
          members: {
            connect: { id: user.id }
          }
        }
      });

      // Link user to chamber
      await tx.user.update({
        where: { id: user.id },
        data: { chamberId: newChamber.id }
      });

      return newChamber;
    });

    await logger.info("New Chamber initialized", { userId: user.id, chamberId: chamber.id });
    return successResponse(chamber, "Chamber created successfully.", 201);
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to initialize Chamber.", error);
  }
}
