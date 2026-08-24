import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import NotificationLog from "@/models/NotificationLog";

// POST /api/webhooks/email-status — Handle email provider delivery webhooks
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { messageId, status, timestamp, bounceType } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    const statusMap: Record<string, string> = {
      delivered: "delivered",
      bounced: "bounced",
      failed: "failed",
      opened: "delivered",
      clicked: "delivered",
    };

    const mappedStatus = statusMap[status] || status;

    const update: any = {
      status: mappedStatus,
      lastAttemptAt: timestamp ? new Date(timestamp) : new Date(),
    };

    if (mappedStatus === "delivered") {
      update.deliveredAt = new Date();
    }

    if (bounceType) {
      update.errorMessage = `Bounce type: ${bounceType}`;
    }

    await NotificationLog.findOneAndUpdate(
      { "metadata.messageId": messageId },
      update
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
