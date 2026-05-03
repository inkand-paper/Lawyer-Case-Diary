import { getAuthContext } from "@/lib/auth-server";
import { successResponse, apiErrors } from "@/lib/api-response";
import db from "@/lib/db";
import { invitationSchema } from "@/lib/validators";
import { logger } from "@/lib/services/logger.service";

export const dynamic = 'force-dynamic';

/**
 * GET: Fetch pending invites for the logged-in user
 */
export async function GET() {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const invites = await db.invitation.findMany({
    where: { 
      email: user.email,
      status: "PENDING"
    },
    include: {
      chamber: {
        select: { name: true }
      }
    }
  });

  return successResponse(invites, "Pending invitations retrieved.");
}

/**
 * POST: Send a new invitation
 */
export async function POST(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  if (!user.chamberId) {
    return apiErrors.BAD_REQUEST("You must belong to a Chamber to send invitations.");
  }

  // Check if user is the owner or an admin of the chamber
  const chamber = await db.chamber.findUnique({
    where: { id: user.chamberId }
  });

  if (chamber?.ownerId !== user.id && user.role !== "ADMIN") {
    return apiErrors.FORBIDDEN("Only the Chamber owner can invite new members.");
  }

  try {
    const body = await req.json();
    const validation = invitationSchema.safeParse(body);
    if (!validation.success) {
      return apiErrors.BAD_REQUEST(validation.error.issues[0].message);
    }

    // Check if an invitation already exists
    const existing = await db.invitation.findFirst({
      where: {
        email: validation.data.email,
        chamberId: user.chamberId,
        status: "PENDING"
      }
    });

    if (existing) {
      return apiErrors.BAD_REQUEST("An invitation has already been sent to this email.");
    }

    // Check if user is already a member
    const existingMember = await db.user.findFirst({
      where: {
        email: validation.data.email,
        chamberId: user.chamberId
      }
    });

    if (existingMember) {
      return apiErrors.BAD_REQUEST("This user is already a member of your Chamber.");
    }

    const invite = await db.invitation.create({
      data: {
        email: validation.data.email,
        chamberId: user.chamberId,
        role: validation.data.role
      }
    });

    // TODO: Send Email Notification via Mailer Service

    await logger.info("Chamber invitation sent", { 
      from: user.id, 
      to: validation.data.email, 
      chamberId: user.chamberId 
    });

    return successResponse(invite, "Invitation sent successfully.", 201);
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to process invitation.", error);
  }
}
