import { NextResponse } from "next/server";
import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return apiErrors.BAD_REQUEST("Token and new password are required.");
    }

    if (password.length < 8) {
      return apiErrors.BAD_REQUEST("Password must be at least 8 characters.");
    }

    // Find user with a valid, non-expired token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return apiErrors.BAD_REQUEST("This reset link is invalid or has expired. Please request a new one.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and clear the reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return successResponse(null, "Your password has been reset successfully. You can now log in.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to reset password.", error);
  }
}
