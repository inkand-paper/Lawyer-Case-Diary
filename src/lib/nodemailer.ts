import nodemailer from "nodemailer";

/**
 * [LEGAL-GRADE MAIL TRANSPORT]
 * Professional Gmail transport for Lawyer Case Diary.
 * Ensures case updates and activation links are delivered securely.
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Lawyer Case Diary" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Legal Mail sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Legal Mail delivery failed:", error);
    return { success: false, error };
  }
}
