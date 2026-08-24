"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Pill,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { PatientSummaryCard } from "@/components/patient/patient-summary-card";

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        const data = await res.json();
        setAppointment(data.appointment);
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAppointment();
  }, [appointmentId]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          cancelReason: "Patient cancelled",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointment(data.appointment);
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setIsCancelling(false);
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
  const isCancelled = appointment.status === "cancelled";
  const canCancel = ["scheduled", "confirmed"].includes(appointment.status);

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

      {/* Appointment Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointment Details</CardTitle>
            <Badge
              variant="secondary"
              className={
                isCancelled
                  ? "bg-red-100 text-red-800"
                  : isCompleted
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
              }
            >
              {appointment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">
                  Dr. {appointment.doctorId?.name || "Unknown"}
                </p>
                {appointment.doctorProfile?.specialisation && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctorProfile.specialisation}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {appointment.slotId?.date
                    ? format(new Date(appointment.slotId.date), "MMMM d, yyyy")
                    : "TBD"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.slotId?.startTime} -{" "}
                  {appointment.slotId?.endTime}
                </p>
              </div>
            </div>
          </div>

          {canCancel && (
            <>
              <Separator />
              <div className="flex flex-wrap items-center gap-3">
                {appointment.slotId?.date && (
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      `Doctor Appointment: Dr. ${appointment.doctorId?.name || "Doctor"}`
                    )}&details=${encodeURIComponent(
                      `Appointment with Dr. ${appointment.doctorId?.name || "Doctor"}\nSpecialisation: ${appointment.doctorProfile?.specialisation || "General Practice"}\nReason: ${appointment.symptomForm?.chiefComplaint || "Consultation"}`
                    )}&location=Hospital+%2F+Telehealth`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Added to Google Calendar
                    </Button>
                  </a>
                )}
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="w-full sm:w-auto"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Appointment"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>



      {/* Symptom Form */}
      {appointment.symptomForm?.chiefComplaint && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-sky-600" />
              Symptoms Reported
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Chief Complaint</p>
              <p>{appointment.symptomForm.chiefComplaint}</p>
            </div>
            {appointment.symptomForm.symptoms?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Symptoms</p>
                <div className="flex flex-wrap gap-1">
                  {appointment.symptomForm.symptoms.map(
                    (s: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {s}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-4 text-sm">
              <span>
                <strong>Duration:</strong> {appointment.symptomForm.duration}
              </span>
              <span>
                <strong>Severity:</strong> {appointment.symptomForm.severity}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post-Visit Summary & Auto-Generated Patient Care Plan */}
      {isCompleted && appointment.postVisitSummary?.diagnosis && (
        <div className="space-y-4">
          <PatientSummaryCard
            summary={appointment.postVisitSummary.generatedSummary}
            diagnosis={appointment.postVisitSummary.diagnosis}
            notes={appointment.postVisitSummary.notes}
            followUpDate={appointment.postVisitSummary.followUpDate}
          />
        </div>
      )}

      {/* Prescription */}
      {isCompleted && appointment.prescription?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-purple-600" />
              Prescription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointment.prescription.map((med: any, i: number) => (
                <div
                  key={i}
                  className="p-3 bg-muted/50 rounded-lg space-y-1"
                >
                  <p className="font-medium">{med.medicationName}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {med.dosage && <span>Dosage: {med.dosage}</span>}
                    {med.frequency && <span>Frequency: {med.frequency}</span>}
                    {med.duration && <span>Duration: {med.duration}</span>}
                  </div>
                  {med.instructions && (
                    <p className="text-sm text-muted-foreground">
                      ℹ️ {med.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
