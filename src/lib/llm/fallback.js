/**
 * Fallback content when the LLM service is unavailable.
 * Ensures graceful degradation — the appointment flow continues
 * even if AI summaries can't be generated.
 */

export const PRE_VISIT_FALLBACK = {
  urgencyLevel: "",
  chiefComplaintSummary:
    "AI summary unavailable. Please review the patient's symptom form directly.",
  suggestedQuestions: [
    "Could you describe your symptoms in more detail?",
    "When did you first notice these symptoms?",
    "Have you experienced anything similar before?",
  ],
  relevantHistory:
    "AI summary unavailable. Please review the patient's medical history in their profile.",
  keyObservations: "AI analysis is currently unavailable.",
};

export const POST_VISIT_FALLBACK = {
  descriptiveSummary:
    "During your consultation, your doctor assessed your condition and provided specific care notes and prescriptions. Please carefully review your prescribed medication regimen and follow all advice given by your healthcare provider. If your symptoms worsen or you experience unexpected side effects, contact your doctor's office immediately.",
};

/**
 * Returns fallback content when LLM is unavailable
 */
export function getPreVisitFallback() {
  return { ...PRE_VISIT_FALLBACK };
}

export function getPostVisitFallback() {
  return { ...POST_VISIT_FALLBACK };
}
