import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { callLLM } from "@/lib/llm/client";
import { POST_VISIT_SYSTEM_PROMPT, buildPostVisitMessage } from "@/lib/llm/post-visit-prompt";
import { getPostVisitFallback } from "@/lib/llm/fallback";
import { scheduleMedicationReminders } from "@/lib/jobs/medication-scheduler";

// POST /api/appointments/[id]/post-visit — Save doctor notes, prescription, generate summary
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["doctor"]);
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const { diagnosis, notes, followUpDate, followUpNotes, prescription } = body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.preVisitSummary?.urgencyLevel) {
      appointment.preVisitSummary.urgencyLevel = appointment.preVisitSummary.urgencyLevel.toLowerCase();
    }

    // Save post-visit data
    appointment.postVisitSummary = {
      diagnosis,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      followUpNotes: followUpNotes || "",
      generatedSummary: "",
      generatedAt: null,
    };
    appointment.prescription = prescription || [];
    appointment.status = "completed";
    await appointment.save();

    // Generate patient-friendly summary via LLM
    const result = await callLLM({
      systemPrompt: POST_VISIT_SYSTEM_PROMPT,
      userMessage: buildPostVisitMessage({
        doctorNotes: notes,
        prescription,
        diagnosis,
        followUpDate,
      }),
      maxTokens: 1500,
    });

    let summaryData;
    if (result.success) {
      try {
        summaryData = JSON.parse(result.text || "{}");
      } catch {
        summaryData = getPostVisitFallback();
      }
    } else {
      summaryData = getPostVisitFallback();
    }

    // Update with generated summary
    await Appointment.findByIdAndUpdate(id, {
      "postVisitSummary.generatedSummary": JSON.stringify(summaryData),
      "postVisitSummary.generatedAt": new Date(),
    });

    // Schedule medication reminders
    let remindersCreated = 0;
    if (prescription && prescription.length > 0) {
      const reminderResult = await scheduleMedicationReminders({
        appointmentId: id,
      });
      remindersCreated = reminderResult.created;
    }

    return NextResponse.json({
      message: "Post-visit notes saved successfully",
      summary: summaryData,
      remindersCreated,
    });
  } catch (error) {
    console.error("Error saving post-visit notes:", error);
    return NextResponse.json(
      { error: "Failed to save post-visit notes" },
      { status: 500 }
    );
  }
}
