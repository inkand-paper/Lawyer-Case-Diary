import { render } from "@react-email/components";
import React from "react";
import { LegalVerificationEmail } from "@/components/emails/verification";
import { ResetPasswordEmail } from "@/components/emails/reset-password";
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
    const html = await render(React.createElement(LegalVerificationEmail, {
      userName,
      verificationCode: token
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

export async function sendPasswordResetEmail({
  email,
  userName,
  token
}: {
  email: string;
  userName: string;
  token: string;
}) {
  try {
    const html = await render(React.createElement(ResetPasswordEmail, {
      userName,
      resetCode: token
    }));

    return await sendEmail({
      to: email,
      subject: "Password Reset Request: Lawyer Case Diary",
      html: html,
    });
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    return { success: false, error };
  }
}

