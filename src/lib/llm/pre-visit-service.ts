import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import PatientProfile from "@/models/PatientProfile";
import { callLLM } from "@/lib/llm/client";
import { PRE_VISIT_SYSTEM_PROMPT, buildPreVisitMessage } from "@/lib/llm/pre-visit-prompt";
import { getPreVisitFallback } from "@/lib/llm/fallback";

export async function generatePreVisitSummaryHelper(appointmentId: string) {
  try {
    await dbConnect();

    const appointment = await Appointment.findById(appointmentId).lean();
    if (!appointment) return null;

    // Get patient medical history
    const patientProfile = await PatientProfile.findOne({
      userId: appointment.patientId,
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

    const preVisitSummary = {
      ...summaryData,
      generatedAt: new Date(),
      rawLlmResponse: result.text || "",
    };

    // Save summary to appointment database record
    await Appointment.findByIdAndUpdate(appointmentId, {
      preVisitSummary,
    });

    return preVisitSummary;
  } catch (error) {
    console.error("Error auto-generating pre-visit summary:", error);
    return null;
  }
}
