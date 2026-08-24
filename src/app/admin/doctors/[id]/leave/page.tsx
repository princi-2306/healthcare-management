"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LeaveCalendar } from "@/components/admin/leave-calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DoctorLeavePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [leaveDays, setLeaveDays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await fetch(`/api/doctors/${doctorId}`);
        const data = await res.json();
        setDoctor(data.doctor);
        setLeaveDays(data.doctor?.profile?.leaveDays || []);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoctor();
  }, [doctorId]);

  const handleAddLeave = async (date: Date, reason: string) => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString(),
          reason,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setLeaveDays((prev) => [...prev, { date, reason }]);
        if (data.conflictsHandled > 0) {
          alert(
            `Leave marked. ${data.conflictsHandled} appointment(s) were cancelled and patients notified.`
          );
        }
      } else {
        alert(data.error || "Failed to mark leave");
      }
    } catch {
      alert("An error occurred");
    }
  };

  const handleRemoveLeave = async (date: Date) => {
    // Remove from local state (API endpoint for removal could be added)
    setLeaveDays((prev) =>
      prev.filter(
        (ld) =>
          new Date(ld.date).toDateString() !== date.toDateString()
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Doctors
      </Button>

      <div>
        <h1 className="text-2xl font-bold">
          Leave Management — Dr. {doctor?.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Mark leave days. Existing appointments on leave days will be
          automatically cancelled.
        </p>
      </div>

      <LeaveCalendar
        leaveDays={leaveDays}
        onAddLeave={handleAddLeave}
        onRemoveLeave={handleRemoveLeave}
      />
    </div>
  );
}
