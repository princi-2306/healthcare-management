"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, ExternalLink, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface ScheduleItem {
  _id: string;
  slot: {
    startTime: string;
    endTime: string;
    date: string;
  };
  patient: {
    name: string;
    image?: string | null;
  };
  status: string;
  symptomForm?: {
    chiefComplaint?: string;
    severity?: string;
  };
}

interface ScheduleListProps {
  items: ScheduleItem[];
  onItemClick?: (id: string) => void;
  showDate?: boolean;
  emptyMessage?: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export function ScheduleList({
  items,
  onItemClick,
  showDate = false,
  emptyMessage = "No appointments scheduled",
}: ScheduleListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const getGoogleCalendarUrl = (item: ScheduleItem) => {
    if (!item.slot?.date) return "#";
    const title = encodeURIComponent(`Patient Appointment: ${item.patient?.name || "Patient"}`);
    const details = encodeURIComponent(
      `Appointment with Patient: ${item.patient?.name || "N/A"}\nReason: ${item.symptomForm?.chiefComplaint || "Consultation"}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card
          key={item._id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onItemClick?.(item._id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[70px]">
                <p className="text-lg font-bold text-sky-600">
                  {item.slot.startTime}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.slot.endTime}
                </p>
                {showDate && item.slot.date && (
                  <p className="text-[10px] text-sky-700 font-medium bg-sky-50 rounded px-1 mt-1">
                    {item.slot.date}
                  </p>
                )}
              </div>
              <div className="h-12 w-px bg-border" />
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-sky-100 text-sky-700 font-bold">
                  {item.patient?.name?.charAt(0)?.toUpperCase() || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {item.patient?.name || "Patient"}
                  </p>
                  <Badge
                    variant="secondary"
                    className={statusColors[item.status] || ""}
                  >
                    {item.status}
                  </Badge>
                </div>
                {item.symptomForm?.chiefComplaint && (
                  <p className="text-sm text-muted-foreground truncate">
                    {item.symptomForm.chiefComplaint}
                  </p>
                )}
              </div>
              <a
                href={getGoogleCalendarUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-emerald-600 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200/60 transition-colors flex items-center gap-1 font-medium shrink-0"
                title="View on Google Calendar"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Added to Google Calendar
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

