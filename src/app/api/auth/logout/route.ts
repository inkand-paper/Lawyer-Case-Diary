import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Server-Side Logout Endpoint
 * Safely clears the HttpOnly 'token' cookie which cannot be accessed by client-side JS.
 */
export async function POST() {
  const cookieStore = await cookies();
  
  // Clear the cookie by setting an expired date
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.json({ 
    success: true, 
    message: "Session terminated successfully." 
  });
}
