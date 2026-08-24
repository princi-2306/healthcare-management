"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface PatientSummaryCardProps {
  summary?: any;
  diagnosis: string;
  notes?: string;
  followUpDate?: string | Date | null;
}

export function PatientSummaryCard({
  summary,
  diagnosis,
  notes,
  followUpDate,
}: PatientSummaryCardProps) {
  let aiDescriptiveText = "";

  if (typeof summary === "string") {
    try {
      const obj = JSON.parse(summary);
      aiDescriptiveText = obj.descriptiveSummary || obj.visitSummary || obj.diagnosisExplanation || "";
    } catch {
      aiDescriptiveText = summary;
    }
  } else if (summary && typeof summary === "object") {
    aiDescriptiveText = summary.descriptiveSummary || summary.visitSummary || summary.diagnosisExplanation || "";
  }

  // Filter out outdated generic fallback texts
  if (aiDescriptiveText.includes("AI summary unavailable")) {
    aiDescriptiveText = "";
  }

  // Build a descriptive, coherent summary paragraph if AI text is unavailable
  let finalSummaryParagraph = aiDescriptiveText;

  if (!finalSummaryParagraph) {
    const parts: string[] = [];
    if (diagnosis) {
      parts.push(`During your consultation, you were diagnosed with ${diagnosis}.`);
    }
    if (notes) {
      parts.push(`Your doctor noted: ${notes}`);
    }
    if (followUpDate) {
      parts.push(
        `A follow-up visit is scheduled for ${format(new Date(followUpDate), "EEEE, MMMM d, yyyy")}.`
      );
    }
    finalSummaryParagraph = parts.join(" ") || "Your consultation details and care instructions have been recorded by your doctor.";
  }

  return (
    <Card className="border-sky-200 bg-sky-50/20 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2 text-sky-950 font-semibold">
            <FileText className="h-5 w-5 text-sky-600" />
            Summary
          </span>
          <span className="text-xs text-sky-700 font-medium flex items-center gap-1 bg-sky-100/80 px-2 py-0.5 rounded-full">
            <Sparkles className="h-3 w-3 text-sky-600" />
            AI Generated
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 leading-relaxed text-justify">
          {finalSummaryParagraph}
        </p>
      </CardContent>
    </Card>
  );
}
