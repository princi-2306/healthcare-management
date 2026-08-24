import { NextRequest, NextResponse } from "next/server";
import { sendAppointmentReminders } from "@/lib/notifications/appointment-notifications";

// GET or POST /api/cron/appointment-reminders — Send reminder emails for upcoming appointments (Patient & Doctor)
export async function GET(req: NextRequest) {
  try {
    const result = await sendAppointmentReminders();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cron appointment reminder error:", error);
    return NextResponse.json({ error: error.message || "Failed to send reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await sendAppointmentReminders();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cron appointment reminder error:", error);
    return NextResponse.json({ error: error.message || "Failed to send reminders" }, { status: 500 });
  }
}
