import { NextResponse } from "next/server";
import db from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

/**
 * Professional Authentication Endpoint
 * Handles secure login with credential verification and session generation.
 */
export async function POST(req: Request) {
  const context = { path: "/api/auth/login", method: "POST" };

  try {
    const body = await req.json();
    
    // 1. Validation
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(
        validationResult.error.issues[0].message, 
        { ...context, payload: body }
      );
    }

    const validatedData = validationResult.data;

    // 2. User Discovery
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return apiErrors.UNAUTHORIZED("Invalid credentials provided.", context);
    }

    // 3. Credential Verification
    const isValid = await comparePassword(validatedData.password, user.passwordHash);

    if (!isValid) {
      return apiErrors.UNAUTHORIZED("Invalid credentials provided.", context);
    }

    // 4. Verification Compliance
    if (!user.emailVerified) {
      return apiErrors.UNAUTHORIZED(
        "Identity verification required. Please check your professional inbox for the activation link.", 
        context
      );
    }

    // 5. Token Provisioning
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    // 5. Response Construction (Web + Mobile Support)
    const response = successResponse(
      { id: user.id, name: user.name, email: user.email, token },
      "Authentication successful. Session established."
    );

    // Provide the cookie for web clients (Next.js frontend)
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    // 6. Professional Error Log
    return apiErrors.SERVER_ERROR(
      "A fatal system state occurred during authentication.",
      error,
      context
    );
  }
}
