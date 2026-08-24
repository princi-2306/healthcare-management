"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DoctorForm } from "@/components/admin/doctor-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        router.push("/admin/doctors");
      } else {
        alert(result.error || "Failed to create doctor");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <DoctorForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
