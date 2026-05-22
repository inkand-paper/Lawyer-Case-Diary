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
      return apiErrors.BAD_REQUEST("Email is already registered to another account.");
    }

    // 3. Password Security & Verification Token
    const passwordHash = await hashPassword(validatedData.password);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    // Token expires in 24 hours
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 4. Data Persistence (SOLID: S)
    const user = await registerUser({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      verificationToken,
      verificationTokenExpiry,
    });

    // 5. Send verification email (fire-and-forget — never fail registration over email)
    const { sendLegalVerificationEmail } = await import("@/lib/mail");
    sendLegalVerificationEmail({
      email: user.email,
      userName: user.name,
      token: verificationToken,
    }).catch((err) => console.error("[REGISTER] Failed to send verification email:", err));

    // 6. Issue short-lived token (unverified session — limited access until email confirmed)
    const token = await signToken({ userId: user.id, email: user.email });

    const response = successResponse(
      { id: user.id, name: user.name, email: user.email, token, emailVerified: false },
      "Account created. Please check your email to verify within 24 hours.",
      201
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    return apiErrors.SERVER_ERROR("A critical failure occurred during registration.", error);
  }
}
