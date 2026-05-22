import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAuthContext } from "@/lib/auth-server";
import { successResponse, apiErrors } from "@/lib/api-response";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();
  
  if (!user.chamberId) {
    return apiErrors.FORBIDDEN("You are not part of a chamber.");
  }

  try {
    const messages = await db.chamberMessage.findMany({
      where: { chamberId: user.chamberId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return successResponse(messages.reverse(), "Messages retrieved.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to load messages", error);
  }
}

export async function POST(req: Request) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();
  
  if (!user.chamberId) {
    return apiErrors.FORBIDDEN("You are not part of a chamber.");
  }

  try {
    const body = await req.json();
    const validation = messageSchema.safeParse(body);
    
    if (!validation.success) {
      return apiErrors.BAD_REQUEST("Invalid message format.");
    }

    const message = await db.chamberMessage.create({
      data: {
        chamberId: user.chamberId,
        userId: user.id,
        content: validation.data.content,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return successResponse(message, "Message sent.", 201);
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to send message", error);
  }
}
