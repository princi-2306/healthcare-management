"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { AlertCircle, MessageSquare, FileText, History } from "lucide-react";

interface PreVisitSummaryCardProps {
  summary: {
    urgencyLevel?: "low" | "medium" | "high" | "critical" | "";
    descriptiveSummary?: string;
    chiefComplaintSummary?: string;
    patientSummary?: string;
    suggestedQuestions?: string[];
    relevantHistory?: string;
    keyObservations?: string;
    generatedAt?: string | null;
  };
  symptomForm?: {
    chiefComplaint: string;
    symptoms: string[];
    duration: string;
    severity: string;
    additionalNotes: string;
  };
}

export function PreVisitSummaryCard({
  summary,
  symptomForm,
}: PreVisitSummaryCardProps) {
  let parsedSummary: any = summary || {};

  // Parse string summary
  if (typeof summary === "string") {
    try {
      parsedSummary = JSON.parse(summary);
    } catch {
      parsedSummary = { descriptiveSummary: summary };
    }
  }

  // If rawLlmResponse exists, parse it to extract structured fields
  if (parsedSummary?.rawLlmResponse && typeof parsedSummary.rawLlmResponse === "string") {
    try {
      const fromRaw = JSON.parse(parsedSummary.rawLlmResponse);
      // Merge LLM fields into parsedSummary (don't overwrite existing fields like generatedAt)
      if (fromRaw.descriptiveSummary) parsedSummary.descriptiveSummary = fromRaw.descriptiveSummary;
      if (fromRaw.chiefComplaintSummary) parsedSummary.chiefComplaintSummary = fromRaw.chiefComplaintSummary;
      if (fromRaw.patientSummary) parsedSummary.patientSummary = fromRaw.patientSummary;
      if (fromRaw.urgencyLevel) parsedSummary.urgencyLevel = fromRaw.urgencyLevel.toLowerCase();
      if (fromRaw.suggestedQuestions) parsedSummary.suggestedQuestions = fromRaw.suggestedQuestions;
      if (fromRaw.missingInformation) parsedSummary.missingInformation = fromRaw.missingInformation;
    } catch {
      // rawLlmResponse might be truncated or invalid — try to extract text
    }
  }

  const isGenerated = !!(
    parsedSummary.generatedAt ||
    parsedSummary.urgencyLevel ||
    parsedSummary.descriptiveSummary ||
    parsedSummary.chiefComplaintSummary ||
    parsedSummary.patientSummary
  );

  // Extract clean text from a value that might be raw JSON or a plain string
  const cleanText = (text?: string) => {
    if (!text) return "";
    let str = String(text).trim();
    // If the text looks like JSON, try to extract the descriptive field from it
    if (str.startsWith("{")) {
      try {
        const obj = JSON.parse(str);
        return obj.descriptiveSummary || obj.chiefComplaintSummary || obj.patientSummary || "";
      } catch {
        // Might be truncated JSON — extract the value after the first key
        const match = str.match(/"(?:descriptiveSummary|chiefComplaintSummary|patientSummary)"\s*:\s*"([^"]*)/);
        if (match) return match[1];
      }
    }
    return str.replace(/^"?(Key Observations|Chief Complaint|Summary|descriptiveSummary)"?:\s*"?/i, "").replace(/"$/, "").trim();
  };

  const complaintText =
    cleanText(parsedSummary.descriptiveSummary) ||
    cleanText(parsedSummary.chiefComplaintSummary) ||
    cleanText(parsedSummary.patientSummary) ||
    symptomForm?.chiefComplaint ||
    "Not provided";
  const historyText = cleanText(parsedSummary.relevantHistory);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            Summary
          </CardTitle>
          <div className="flex items-center gap-2">
            {parsedSummary.urgencyLevel && (
              <UrgencyBadge level={parsedSummary.urgencyLevel} />
            )}
            {!isGenerated && (
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                AI Pending
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chief Complaint Summary */}
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-sky-600" />
            Chief Complaint & Assessment
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {complaintText}
          </p>
        </div>

        {/* Key Observations */}
        {parsedSummary.keyObservations && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-1 text-amber-900">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Key Clinical Observations
            </h4>
            <p className="text-sm text-amber-950 bg-amber-50 p-3 rounded-lg border border-amber-200 leading-relaxed">
              {cleanText(parsedSummary.keyObservations)}
            </p>
          </div>
        )}

        {/* Symptoms */}
        {symptomForm?.symptoms && symptomForm.symptoms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Reported Symptoms</h4>
            <div className="flex flex-wrap gap-1.5">
              {symptomForm.symptoms.map((symptom, i) => (
                <Badge key={i} variant="secondary" className="bg-sky-50 text-sky-800 hover:bg-sky-100">
                  {symptom}
                </Badge>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>Duration: <strong className="text-gray-800">{symptomForm.duration}</strong></span>
              <span>Reported Severity: <strong className="text-gray-800">{symptomForm.severity}</strong></span>
            </div>
          </div>
        )}

        <Separator />

        {/* Patient's Questions */}
        {parsedSummary.suggestedQuestions && parsedSummary.suggestedQuestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-sky-600" />
              Patient's Questions
            </h4>
            <ul className="space-y-1.5">
              {parsedSummary.suggestedQuestions.map((q: string, i: number) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-sky-600 font-semibold">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Patient Summary */}
        {parsedSummary.patientSummary && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-sky-600" />
              Patient Summary
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {cleanText(parsedSummary.patientSummary)}
            </p>
          </div>
        )}

        {/* Missing Information */}
        {parsedSummary.missingInformation && parsedSummary.missingInformation.length > 0 && (
          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
            <h4 className="text-sm font-medium text-amber-900 mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Important Information Missing
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {parsedSummary.missingInformation.map((info: string, idx: number) => (
                <li key={idx} className="text-xs text-amber-900">
                  {info}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Relevant History */}
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
            <History className="h-4 w-4 text-sky-600" />
            Relevant Medical History
          </h4>
          <p className="text-sm text-muted-foreground">
            {historyText || "No prior medical history records provided for this patient profile."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
