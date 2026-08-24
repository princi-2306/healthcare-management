"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PreVisitSummaryCard } from "@/components/doctor/pre-visit-summary-card";
import { PostVisitForm } from "@/components/doctor/post-visit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, User, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function DoctorAppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        const data = await res.json();
        setAppointment(data.appointment);

        // Auto-generate pre-visit summary if not generated yet
        if (data.appointment && !data.appointment.preVisitSummary?.generatedAt) {
          generatePreVisitSummary();
        }
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAppointment();
  }, [appointmentId]);

  const generatePreVisitSummary = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(
        `/api/appointments/${appointmentId}/pre-visit-summary`,
        { method: "POST" }
      );
      const data = await res.json();
      if (res.ok) {
        setAppointment((prev: any) => ({
          ...prev,
          preVisitSummary: {
            ...data.summary,
            generatedAt: new Date().toISOString(),
          },
        }));
      }
    } catch (err) {
      console.error("Failed to generate summary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostVisitSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/appointments/${appointmentId}/post-visit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) {
        const result = await res.json();
        alert("Post-visit notes saved successfully!");
        router.push("/doctor/dashboard");
      } else {
        alert("Failed to save post-visit notes");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Appointment not found</p>
      </div>
    );
  }

  const isCompleted = appointment.status === "completed";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Patient & Appointment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patient Appointment</CardTitle>
            <Badge
              variant="secondary"
              className={
                isCompleted
                  ? "bg-gray-100 text-gray-800"
                  : "bg-blue-100 text-blue-800"
              }
            >
              {appointment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">
                  {appointment.patientId?.name || "Unknown"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {appointment.slotId?.date
                    ? format(
                        new Date(appointment.slotId.date),
                        "MMM d, yyyy"
                      )
                    : "TBD"}{" "}
                  at {appointment.slotId?.startTime}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Visit AI Summary */}
      <div className="space-y-3">
        <PreVisitSummaryCard
          summary={
            appointment.preVisitSummary || {
              urgencyLevel: "",
              chiefComplaintSummary: "",
              suggestedQuestions: [],
              relevantHistory: "",
              generatedAt: null,
            }
          }
          symptomForm={appointment.symptomForm}
        />
      </div>

      <Separator />

      {/* Post-Visit Form (only show if not completed) */}
      {!isCompleted ? (
        <PostVisitForm
          onSubmit={handlePostVisitSubmit}
          isSubmitting={isSubmitting}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Post-Visit Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Diagnosis</p>
              <p className="font-medium">
                {appointment.postVisitSummary?.diagnosis}
              </p>
            </div>
            {appointment.postVisitSummary?.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p>{appointment.postVisitSummary.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
