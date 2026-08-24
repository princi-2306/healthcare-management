import { sendEmail } from "./client";
import dbConnect from "../db";
import NotificationLog from "../../models/NotificationLog";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [60000, 300000, 900000]; // 1min, 5min, 15min

/**
 * Send an email and log the notification attempt.
 * Supports automatic retry on failure.
 */
export async function sendWithRetry({
  appointmentId,
  recipientId,
  to,
  subject,
  html,
  text,
  type,
  attachments = undefined,
  icalEvent = undefined,
}) {
  await dbConnect();

  // Create notification log entry
  const log = await NotificationLog.create({
    appointmentId,
    recipientId,
    type,
    channel: "email",
    status: "pending",
    subject,
    body: html || text,
    retryCount: 0,
    maxRetries: MAX_RETRIES,
    lastAttemptAt: new Date(),
  });

  const result = await sendEmail({ to, subject, html, text, attachments, icalEvent });

  if (result.success) {
    await NotificationLog.findByIdAndUpdate(log._id, {
      status: "sent",
      lastAttemptAt: new Date(),
      metadata: { messageId: result.messageId },
    });
    return { success: true, logId: log._id };
  }

  // Mark as failed for retry
  await NotificationLog.findByIdAndUpdate(log._id, {
    status: "failed",
    errorMessage: result.error,
    lastAttemptAt: new Date(),
  });

  return { success: false, logId: log._id, error: result.error };
}

/**
 * Retry failed notifications
 */
export async function retryFailedNotifications() {
  await dbConnect();

  const failedNotifications = await NotificationLog.find({
    status: "failed",
    retryCount: { $lt: MAX_RETRIES },
  })
    .populate("recipientId", "email name")
    .limit(50);

  const results = [];

  for (const notification of failedNotifications) {
    const result = await sendEmail({
      to: notification.recipientId?.email,
      subject: notification.subject,
      html: notification.body,
    });

    if (result.success) {
      await NotificationLog.findByIdAndUpdate(notification._id, {
        status: "sent",
        retryCount: notification.retryCount + 1,
        lastAttemptAt: new Date(),
      });
      results.push({ id: notification._id, status: "sent" });
    } else {
      const newRetryCount = notification.retryCount + 1;
      await NotificationLog.findByIdAndUpdate(notification._id, {
        retryCount: newRetryCount,
        status: newRetryCount >= MAX_RETRIES ? "failed" : "pending",
        errorMessage: result.error,
        lastAttemptAt: new Date(),
      });
      results.push({ id: notification._id, status: "retry-failed" });
    }
  }

  return results;
}
