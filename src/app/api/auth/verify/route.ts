import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return apiErrors.BAD_REQUEST("Missing email or verification code.");
    }

    // 1. Find user with this email
    const user = await db.user.findUnique({
      where: { email },
    });

    // 2. Validate token AND expiry
    const now = new Date();
    const tokenValid = user?.verificationToken === code;
    // verificationTokenExpiry may be null for older accounts (before this fix)
    // — in that case we treat the token as expired for safety.
    const notExpired =
      user?.verificationTokenExpiry != null && user.verificationTokenExpiry > now;

    if (!user || !tokenValid || !notExpired) {
      return apiErrors.BAD_REQUEST("Invalid or expired verification code. Please request a new one.");
    }

    if (user.emailVerified) {
      return successResponse(null, "Email is already verified.");
    }

    // 3. Activate Account — clear token on success
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return successResponse(null, "Account successfully verified.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to verify account.", error);
  }
}
