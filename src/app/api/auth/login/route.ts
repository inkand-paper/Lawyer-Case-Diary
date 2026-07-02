import db from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { successResponse, apiErrors } from "@/lib/api-response";
import { createRefreshToken } from "@/lib/services/auth.service";

/**
 * Professional Authentication Endpoint
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validation
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.BAD_REQUEST(validationResult.error.issues[0].message);
    }

    const { email, password } = validationResult.data;

    // 2. User Discovery & Verification
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return apiErrors.UNAUTHORIZED("Invalid credentials provided.");
    }

    if (!user.emailVerified) {
      return apiErrors.UNAUTHORIZED("Identity verification required. Please check your inbox.");
    }

    // 3. Token Provisioning (Access + Refresh)
    const accessToken = await signToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = await createRefreshToken(user.id);

    // 4. Response Construction
    // refreshToken is included in the body (in addition to the httpOnly
    // cookie below) because native clients — the Android app in particular —
    // can't read httpOnly cookies. It has no route to obtain a refresh
    // token otherwise, which meant every mobile session died silently
    // ~1hr after login with no way to recover. Web clients continue to
    // rely on the cookie and simply ignore this field.
    const response = successResponse(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        plan: user.plan,
        token: accessToken,
        refreshToken,
      },
      "Authentication successful."
    );

    // 5. Secure Cookie Deployment (SOLID: S - Session Hardening)
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour (Access Token)
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days (Refresh Token)
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    return apiErrors.SERVER_ERROR("A fatal system state occurred during authentication.", error);
  }
}
