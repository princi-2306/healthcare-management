"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DoctorForm } from "@/components/admin/doctor-form";
import { WorkingHoursEditor } from "@/components/admin/working-hours-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditDoctorPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await fetch(`/api/doctors/${doctorId}`);
        const data = await res.json();
        setDoctor(data.doctor);
        setWorkingHours(data.doctor?.profile?.workingHours || []);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoctor();
  }, [doctorId]);

  const handleProfileUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/doctors/${doctorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Doctor profile updated successfully");
      } else {
        alert("Failed to update doctor");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveWorkingHours = async () => {
    setIsSavingHours(true);
    try {
      const res = await fetch(`/api/doctors/${doctorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workingHours }),
      });

      if (res.ok) {
        alert("Working hours saved successfully");
      } else {
        alert("Failed to save working hours");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setIsSavingHours(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Doctors
      </Button>

      <h1 className="text-2xl font-bold">Edit Dr. {doctor.name}</h1>

      <DoctorForm
        onSubmit={handleProfileUpdate}
        isSubmitting={isSubmitting}
        isEdit
        defaultValues={{
          specialisation: doctor.profile?.specialisation || "",
          qualification: doctor.profile?.qualification || "",
          experience: doctor.profile?.experience || 0,
          bio: doctor.profile?.bio || "",
          phone: doctor.profile?.phone || "",
          consultationFee: doctor.profile?.consultationFee || 0,
          slotDurationMins: doctor.profile?.slotDurationMins || 30,
        }}
      />

      <WorkingHoursEditor
        workingHours={workingHours}
        onChange={setWorkingHours}
      />

      <Button
        onClick={handleSaveWorkingHours}
        disabled={isSavingHours}
        className="w-full"
      >
        {isSavingHours ? "Saving Working Hours..." : "Save Working Hours"}
      </Button>
    </div>
  );
}
