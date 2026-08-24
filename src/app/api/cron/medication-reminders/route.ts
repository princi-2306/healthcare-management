import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MedicationReminder from "@/models/MedicationReminder";
import User from "@/models/User";
import { sendEmail } from "@/lib/email/client";
import { medicationReminderTemplate } from "@/lib/email/templates/medication-reminder";

// GET /api/cron/medication-reminders — Vercel Cron target
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    // Find reminders due within the next 30 minutes that haven't been sent
    const dueReminders = await MedicationReminder.find({
      scheduledAt: { $lte: thirtyMinutesFromNow },
      sent: false,
    })
      .populate("patientId", "name email")
      .limit(100);

    let sent = 0;
    let failed = 0;

    for (const reminder of dueReminders) {
      const patient = reminder.patientId;
      if (!patient?.email) {
        failed++;
        continue;
      }

      const result = await sendEmail({
        to: patient.email,
        subject: `💊 Medication Reminder: ${reminder.medicationName}`,
        text: `Hello ${patient.name}, this is a reminder to take your medication: ${reminder.medicationName}. Dosage: ${reminder.dosage || "As prescribed"}. Instructions: ${reminder.instructions || "None"}.`,
        html: medicationReminderTemplate({
          patientName: patient.name,
          medicationName: reminder.medicationName,
          dosage: reminder.dosage,
          instructions: reminder.instructions,
        }),
      });

      if (result.success) {
        await MedicationReminder.findByIdAndUpdate(reminder._id, {
          sent: true,
          sentAt: new Date(),
        });
        sent++;
      } else {
        failed++;
      }
    }

    return NextResponse.json({
      processed: dueReminders.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Medication reminder cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
