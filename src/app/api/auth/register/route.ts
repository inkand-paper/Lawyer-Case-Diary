import db from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import { validateRequest } from "@/lib/request-handler";
import { registerUser } from "@/lib/services/auth.service";

/**
 * Professional Registration Endpoint
 */
export async function POST(req: Request) {
  // 1. Validation & Sanitization (SOLID: S)
  const validation = await validateRequest(req, registerSchema);
  if (!validation.success) {
    return apiErrors.BAD_REQUEST(validation.error);
  }

  const validatedData = validation.data;

  try {
    // 2. Uniqueness Check
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return apiErrors.BAD_REQUEST("Electronic mail is already registered to another account.");
    }

    // 3. Password Security & Tokens
    const passwordHash = await hashPassword(validatedData.password);
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // 4. Data Persistence (SOLID: S)
    const user = await registerUser({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      verificationToken
    });

    // 5. Async side-effects (Email)
    const { sendLegalVerificationEmail } = await import("@/lib/mail");
    await sendLegalVerificationEmail({
      email: user.email,
      userName: user.name,
      token: verificationToken
    }).catch(console.error);

    // 6. Session Management
    const token = await signToken({ userId: user.id, email: user.email });

    const response = successResponse(
      { id: user.id, name: user.name, email: user.email, token, emailVerified: false },
      "Regulatory account created. Please verify your email to unlock your diary.",
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
  } catch (error: unknown) {
    return apiErrors.SERVER_ERROR("A critical failure occurred during the registration process.", error);
  }
}
