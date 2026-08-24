/**
 * Generates the system prompt for post-visit AI summary generation.
 * The LLM processes doctor notes and prescription to create a
 * patient-friendly visit summary.
 */
export const POST_VISIT_SYSTEM_PROMPT = `You are an expert clinical medical AI assistant creating post-visit summaries for patients.
Your task is to analyze the doctor's diagnosis, clinical notes, prescribed medications, and follow-up instructions, and generate a clear, comprehensive, and descriptive paragraph summarizing the entire consultation for the patient.

Guidelines:
1. Write a well-structured, easy-to-read paragraph.
2. Explain the diagnosis, what the doctor's notes indicate, why each prescribed medication is given and how it should be used, key warning signs or lifestyle advice, and the follow-up plan.
3. Keep the tone professional, empathetic, and patient-friendly.
4. Output your response as a valid JSON object with a single key: "descriptiveSummary".

Example output format:
{
  "descriptiveSummary": "During your consultation, you were diagnosed with... Based on your doctor's assessment..."
}`;

/**
 * Build the user message for the post-visit summary prompt
 */
export function buildPostVisitMessage({ doctorNotes, prescription, diagnosis, followUpDate }) {
  let notesDetails = `Diagnosis: ${diagnosis || "Not recorded"}. Clinical Notes: ${doctorNotes || "Not provided"}.`;

  if (prescription && prescription.length > 0) {
    notesDetails += ` Prescribed Medications: `;
    notesDetails += prescription
      .map((med) => {
        let medStr = med.medicationName;
        if (med.dosage) medStr += ` (${med.dosage})`;
        if (med.frequency) medStr += ` - ${med.frequency}`;
        if (med.duration) medStr += ` for ${med.duration}`;
        if (med.instructions) medStr += ` [Instructions: ${med.instructions}]`;
        return medStr;
      })
      .join(", ");
  }

  if (followUpDate) {
    notesDetails += ` Follow-up Date: ${followUpDate}.`;
  }

  return `Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <${notesDetails}>`;
}
