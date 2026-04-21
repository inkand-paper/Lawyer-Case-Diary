import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";

export const dynamic = 'force-dynamic';

/**
 * Professional Registration Endpoint
 * Handles user creation with secure hashing and standardized error states.
 */
export async function POST(req: Request) {
  const context = { path: "/api/auth/register", method: "POST" };
  
  try {
    const body = await req.json();
    
    // 1. Validation
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(
        validationResult.error.issues[0].message, 
        { ...context, payload: body }
      );
    }

    const validatedData = validationResult.data;

    // 2. Uniqueness Check
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return apiErrors.BAD_REQUEST("Electronic mail is already registered to another account.", context);
    }

    // 3. Password Security
    const passwordHash = await hashPassword(validatedData.password);

    // 4. Data Persistence
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
      },
    });

    // 5. Auth Token Generation
    const token = await signToken({ userId: user.id, email: user.email });

    // 6. Success Response with Secure Cookie (Web + Mobile Support)
    const response = successResponse(
      { id: user.id, name: user.name, email: user.email, token },
      "Regulatory account created and authenticated successfully.",
      201
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    // 7. Standardized Server Error Handling
    return apiErrors.SERVER_ERROR(
      "A critical failure occurred during the registration process.",
      error,
      context
    );
  }
}
