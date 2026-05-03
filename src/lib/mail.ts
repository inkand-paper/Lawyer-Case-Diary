import { render } from "@react-email/components";
import React from "react";
import { LegalVerificationEmail } from "@/components/emails/verification";
import { sendEmail } from "./nodemailer";

/**
 * [LEGAL MAIL DISPATCHER]
 * Handles all professional communications for the Lawyer Case Diary.
 */

export async function sendLegalVerificationEmail({
  email,
  userName,
  token
}: {
  email: string;
  userName: string;
  token: string;
}) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/api/auth/verify?token=${token}`;

    const html = await render(React.createElement(LegalVerificationEmail, {
      userName,
      verificationUrl
    }));

    return await sendEmail({
      to: email,
      subject: "Professional Identity Verification: Lawyer Case Diary",
      html: html,
    });
  } catch (error) {
    console.error("❌ Failed to send legal verification email:", error);
    return { success: false, error };
  }
}
