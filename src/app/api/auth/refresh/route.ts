import { successResponse, apiErrors } from "@/lib/api-response";
import { rotateRefreshToken } from "@/lib/services/auth.service";
import { cookies } from "next/headers";

/**
 * Token Rotation Endpoint
 * SOLID: S (Single Responsibility for session security)
 * Implements Refresh Token Rotation to prevent token reuse and session hijacking.
 */
export async function POST() {
  const cookieStore = await cookies();
  const oldRefreshToken = cookieStore.get("refreshToken")?.value;

  if (!oldRefreshToken) {
    return apiErrors.UNAUTHORIZED("Refresh token missing from secure vault.");
  }

  try {
    const { accessToken, refreshToken, user } = await rotateRefreshToken(oldRefreshToken);

    // Same reasoning as login/route.ts: refreshToken must be in the body
    // for native clients that can't read httpOnly cookies (rotated token
    // included so the Android app can persist the new one).
    const response = successResponse(
      { id: user.id, name: user.name, email: user.email, token: accessToken, refreshToken },
      "Session synchronized successfully."
    );

    // Update Cookies
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return apiErrors.UNAUTHORIZED("Session synchronization failed. Please login again.");
  }
}
