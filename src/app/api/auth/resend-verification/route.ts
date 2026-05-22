import db from "@/lib/db";
import { successResponse, apiErrors } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return apiErrors.BAD_REQUEST("Email is required.");

    // Rate limit: max 3 resend requests per email per 15 minutes
    const { success } = await checkRateLimit(`resend:${email}`, 3, 15 * 60 * 1000);
    if (!success) {
      return apiErrors.BAD_REQUEST("Too many verification requests. Please wait 15 minutes before trying again.");
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) return apiErrors.NOT_FOUND("No account found with this email.");

    if (user.emailVerified) {
      return apiErrors.BAD_REQUEST("This account is already verified. Please login.");
    }

    // Generate a fresh 6-digit OTP with 24-hour expiry
    const newToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.update({
      where: { email },
      data: {
        verificationToken: newToken,
        verificationTokenExpiry,
      },
    });

    const { sendEmail } = await import("@/lib/nodemailer");
    const result = await sendEmail({
      to: user.email,
      subject: "Your Verification Code — Lawyer Case Diary",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0a0a0a;color:#fff;border-radius:16px;">
          <h2 style="font-size:24px;font-weight:900;margin-bottom:8px;">Verify Your Account</h2>
          <p style="color:#888;margin-bottom:24px;">Hi ${user.name}, here is your new 6-digit verification code:</p>
          <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:24px;text-align:center;font-size:40px;font-weight:900;letter-spacing:0.5em;">${newToken}</div>
          <p style="color:#888;margin-top:24px;font-size:12px;">This code expires in <strong style="color:#fff">24 hours</strong>. Do not share it with anyone.</p>
        </div>
      `,
    });

    if (!result.success) {
      console.error("Mail send failed:", result.error);
      return apiErrors.SERVER_ERROR("Failed to send email. Please try again later.");
    }

    return successResponse(null, "A fresh verification code has been sent to your inbox. It expires in 24 hours.");
  } catch (error) {
    return apiErrors.SERVER_ERROR("Failed to resend verification code.", error);
  }
}
