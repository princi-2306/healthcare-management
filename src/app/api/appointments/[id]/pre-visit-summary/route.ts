import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import PatientProfile from "@/models/PatientProfile";
import { callLLM } from "@/lib/llm/client";
import { PRE_VISIT_SYSTEM_PROMPT, buildPreVisitMessage } from "@/lib/llm/pre-visit-prompt";
import { getPreVisitFallback } from "@/lib/llm/fallback";

// POST /api/appointments/[id]/pre-visit-summary — Generate AI pre-visit summary
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["doctor", "admin"]);
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();
    const { id } = await params;

    const appointment = await Appointment.findById(id)
      .populate("patientId", "name email")
      .lean();

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Get patient medical history
    const patientProfile = await PatientProfile.findOne({
      userId: appointment.patientId?._id,
    }).lean();

    // Call LLM
    const result = await callLLM({
      systemPrompt: PRE_VISIT_SYSTEM_PROMPT,
      userMessage: buildPreVisitMessage({
        symptomForm: appointment.symptomForm,
        medicalHistory: patientProfile?.medicalHistory || [],
        patientInfo: {
          gender: patientProfile?.gender,
        },
      }),
    });

    let summaryData;

    if (result.success) {
      try {
        summaryData = JSON.parse(result.text || "{}");
      } catch {
        summaryData = getPreVisitFallback();
        summaryData.chiefComplaintSummary = result.text || "";
      }
    } else {
      summaryData = getPreVisitFallback();
    }

    if (summaryData && typeof summaryData.urgencyLevel === "string") {
      summaryData.urgencyLevel = summaryData.urgencyLevel.toLowerCase();
    }

    // Save summary to appointment
    await Appointment.findByIdAndUpdate(id, {
      preVisitSummary: {
        ...summaryData,
        generatedAt: new Date(),
        rawLlmResponse: result.text || "",
      },
    });

    return NextResponse.json({
      summary: summaryData,
      generated: result.success,
    });
  } catch (error) {
    console.error("Error generating pre-visit summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
