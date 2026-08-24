"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SymptomForm } from "@/components/patient/symptom-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export default function BookSlotPage() {
  const params = useParams();
  const router = useRouter();
  const slotId = params.slotId as string;

  const [slot, setSlot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // We don't have a direct slot API, but we have the slot ID
    // The booking will use this slot ID directly
    setSlot({ _id: slotId });
    setIsLoading(false);
  }, [slotId]);

  const handleSubmit = async (symptomData: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          symptomForm: symptomData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/patient/appointments/${data.appointment._id}`);
      } else {
        alert(data.error || "Booking failed. Please try again.");
      }
    } catch {
      alert("An error occurred. Please try again.");
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Complete Your Booking</h1>
        <p className="text-muted-foreground mt-1">
          Please fill in your symptom information to help the doctor prepare
        </p>
      </div>

      <Card className="bg-sky-50 border-sky-200">
        <CardContent className="p-4">
          <p className="text-sm text-sky-700">
            ⏱ Your slot is held for 10 minutes. Please complete the booking
            before it expires.
          </p>
        </CardContent>
      </Card>

      <SymptomForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
