"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, User, ChevronRight, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface AppointmentCardProps {
  appointment: {
    _id: string;
    status: string;
    symptomForm?: {
      chiefComplaint?: string;
    };
    createdAt: string;
  };
  doctor?: {
    name: string;
    image?: string | null;
  };
  doctorProfile?: {
    specialisation: string;
  };
  slot?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800" },
  "in-progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
  "no-show": { label: "No Show", className: "bg-orange-100 text-orange-800" },
};

export function AppointmentCard({
  appointment,
  doctor,
  doctorProfile,
  slot,
}: AppointmentCardProps) {
  const status = statusConfig[appointment.status] || statusConfig.scheduled;

  const getGoogleCalendarUrl = () => {
    if (!slot?.date) return "#";
    const baseDate = new Date(slot.date);
    const startStr = slot.startTime || "09:00";
    const endStr = slot.endTime || "09:30";

    const formatGDate = (d: Date, t: string) => {
      const [h, m] = t.split(":").map(Number);
      const newD = new Date(d);
      newD.setHours(h || 0, m || 0, 0, 0);
      return newD.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const title = encodeURIComponent(`Doctor Appointment: Dr. ${doctor?.name || "Doctor"}`);
    const details = encodeURIComponent(
      `Appointment with Dr. ${doctor?.name || "Doctor"}\nSpecialisation: ${doctorProfile?.specialisation || "General"}\nReason: ${appointment.symptomForm?.chiefComplaint || "Consultation"}`
    );

    const dates = `${formatGDate(baseDate, startStr)}/${formatGDate(baseDate, endStr)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-sky-100 text-sky-700 font-bold">
                {doctor?.name?.charAt(0)?.toUpperCase() || "D"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  Dr. {doctor?.name || "Unknown"}
                </h3>
                <Badge variant="secondary" className={status.className}>
                  {status.label}
                </Badge>
              </div>
              {doctorProfile?.specialisation && (
                <p className="text-sm text-muted-foreground">
                  {doctorProfile.specialisation}
                </p>
              )}
              {slot && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(slot.date), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              )}
              {appointment.symptomForm?.chiefComplaint && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  &quot;{appointment.symptomForm.chiefComplaint}&quot;
                </p>
              )}
              {slot?.date && (
                <div className="pt-1">
                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Add to Google Calendar
                  </a>
                </div>
              )}
            </div>
          </div>
          <Link href={`/patient/appointments/${appointment._id}`}>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

