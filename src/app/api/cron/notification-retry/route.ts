import { NextRequest, NextResponse } from "next/server";
import { runNotificationRetry } from "@/lib/jobs/notification-retry";

// GET /api/cron/notification-retry — Vercel Cron target for retrying failed notifications
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runNotificationRetry();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Notification retry cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
