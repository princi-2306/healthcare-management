"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SlotPicker } from "@/components/patient/slot-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Stethoscope,
  GraduationCap,
  Clock,
  IndianRupee,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await fetch(`/api/doctors/${doctorId}`);
        const data = await res.json();
        setDoctor(data.doctor);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDate) return;

    async function fetchSlots() {
      setSlotsLoading(true);
      try {
        const dateStr = format(selectedDate!, "yyyy-MM-dd");
        const res = await fetch(
          `/api/doctors/${doctorId}/slots?date=${dateStr}`
        );
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [selectedDate, doctorId]);

  const handleSlotSelect = async (slot: any) => {
    // Hold the slot and navigate to booking
    try {
      const res = await fetch(`/api/slots/${slot._id}/hold`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/patient/book/${slot._id}`);
      } else {
        alert(data.error || "Failed to hold slot");
      }
    } catch {
      alert("Failed to hold slot. Please try again.");
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
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
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

      {/* Doctor Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-sky-100 text-sky-700 text-2xl">
                {doctor.name?.charAt(0)?.toUpperCase() || "D"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Dr. {doctor.name}</h1>
              <Badge
                variant="secondary"
                className="bg-sky-50 text-sky-700 mt-2"
              >
                {doctor.profile?.specialisation}
              </Badge>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {doctor.profile?.qualification && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    {doctor.profile.qualification}
                  </div>
                )}
                {doctor.profile?.experience > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {doctor.profile.experience} years
                  </div>
                )}
                {doctor.profile?.consultationFee > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                    ₹{doctor.profile.consultationFee}
                  </div>
                )}
              </div>

              {doctor.profile?.bio && (
                <p className="text-sm text-muted-foreground mt-4">
                  {doctor.profile.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Slot Picker */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>
        <SlotPicker
          slots={slots}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onSlotSelect={handleSlotSelect}
          isLoading={slotsLoading}
        />
      </div>
    </div>
  );
}
