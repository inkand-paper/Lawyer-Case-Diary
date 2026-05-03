import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    // 1. Find user with this token
    const user = await db.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link." }, 
        { status: 404 }
      );
    }

    // 2. Activate Account
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null, // Wipe token after successful use
      },
    });

    // 3. Redirect to login with success signal
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/login?verified=true`);
  } catch (error) {
    console.error("❌ Verification fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
