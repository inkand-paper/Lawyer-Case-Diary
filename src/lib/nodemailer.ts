import nodemailer from "nodemailer";

/**
 * [LEGAL-GRADE MAIL TRANSPORT: LOAD BALANCED]
 * Multiple Gmail Transports to prevent hitting the 500 emails/day quota limit.
 * Expects environment variable: GMAIL_ACCOUNTS="email1:pass1,email2:pass2" 
 * Fallbacks to single GMAIL_USER / GMAIL_APP_PASSWORD for backwards compatibility.
 */

function getRandomTransporter() {
  const accountsString = process.env.GMAIL_ACCOUNTS;
  
  if (accountsString) {
    const accounts = accountsString.split(",").map(a => a.trim()).filter(Boolean);
    if (accounts.length > 0) {
      // Pick a random account from the configured pool to perfectly balance the load
      const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
      const [user, pass] = randomAccount.split(":");
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
      return { transporter, user };
    }
  }

  // Fallback to single legacy account
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return { transporter, user: process.env.GMAIL_USER || 'noreply' };
}

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
    const { transporter, user: sendingUser } = getRandomTransporter();

    const info = await transporter.sendMail({
      from: `"Lawyer Case Diary" <${sendingUser}>`,
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
