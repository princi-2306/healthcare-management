import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const secure = process.env.SMTP_SECURE !== "false" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.trim(),
    } : undefined,
  });
}

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
  const rawFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || "204.priyanshi@gmail.com";
  const cleanFrom = rawFrom.replace(/^["']|["']$/g, "").trim();

  const mailOptions = {
    from: cleanFrom,
    to,
    subject,
    html,
    text,
    ...(attachments && { attachments }),
    ...(icalEvent && { icalEvent }),
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
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
    await getTransporter().verify();
    return true;
  } catch (error) {
    console.error("SMTP connection verification failed:", error);
    return false;
  }
}

export default getTransporter;
