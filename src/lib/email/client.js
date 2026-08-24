import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email using the configured transporter
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments = undefined,
  icalEvent = undefined,
}) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "Healthcare Platform <noreply@healthcare.app>",
    to,
    subject,
    html,
    text,
    ...(attachments && { attachments }),
    ...(icalEvent && { icalEvent }),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email send failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyConnection() {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("SMTP connection verification failed:", error);
    return false;
  }
}

export default transporter;
