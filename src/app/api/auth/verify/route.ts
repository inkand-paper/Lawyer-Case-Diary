import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or verification code" }, { status: 400 });
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
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Email is already verified." });
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

    return NextResponse.json({ success: true, message: "Account successfully verified." });
  } catch (error) {
    console.error("❌ Verification fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
