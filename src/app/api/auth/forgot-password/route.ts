import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/ratelimit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Rate limit: max 3 reset requests per IP per 15 minutes
    // Prevents reset email bombing and account enumeration via timing
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000);
    if (!success) {
      return successResponse(
        null,
        "If an account exists, a password reset link has been sent."
      );
      // Note: Return success even when rate-limited to prevent enumeration
    }

    const { email } = await req.json();
    if (!email) return apiErrors.BAD_REQUEST("Email is required.");

    const user = await db.user.findUnique({ where: { email } });

    // Always return success regardless of whether the account exists
    // This prevents email enumeration attacks
    if (!user) {
      return successResponse(null, "If an account exists, a password reset link has been sent.");
    }

    // Generate a secure cryptographic token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const { sendEmail } = await import("@/lib/nodemailer");
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password — Lawyer Case Diary",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0a0a0a;color:#fff;border-radius:16px;">
          <h2 style="font-size:24px;font-weight:900;margin-bottom:8px;">Password Reset</h2>
          <p style="color:#888;margin-bottom:24px;">Hi ${user.name}, click the button below to reset your password. This link expires in <strong style="color:#fff">1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:block;background:#fff;color:#000;text-align:center;padding:18px 24px;border-radius:12px;font-weight:900;text-decoration:none;font-size:14px;letter-spacing:0.1em;">
            RESET PASSWORD
          </a>
          <p style="color:#555;margin-top:24px;font-size:12px;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
          <p style="color:#333;margin-top:8px;font-size:11px;word-break:break-all;">${resetUrl}</p>
        </div>
      `,
    });

    return successResponse(null, "If an account exists, a password reset link has been sent.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to process password reset request.", error);
  }
}
