import { retryFailedNotifications } from "../email/send-with-retry";

/**
 * Job to retry failed notification deliveries.
 * Called by the Vercel Cron endpoint or node-cron scheduler.
 */
export async function runNotificationRetry() {
  try {
    const results = await retryFailedNotifications();
    
    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "retry-failed").length;

    console.log(
      `Notification retry job completed: ${sent} sent, ${failed} still failing out of ${results.length} total`
    );

    return {
      success: true,
      processed: results.length,
      sent,
      failed,
    };
  } catch (error) {
    console.error("Notification retry job failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
