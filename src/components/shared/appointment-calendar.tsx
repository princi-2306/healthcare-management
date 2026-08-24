"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from "date-fns";
import Link from "next/link";

interface AppointmentCalendarProps {
  appointments: any[];
  role: "patient" | "doctor" | "admin";
  isLoading?: boolean;
}

export function AppointmentCalendar({
  appointments = [],
  role,
  isLoading = false,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Map appointments by date string "YYYY-MM-DD"
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    appointments.forEach((apt) => {
      if (!apt.slotId?.date) return;
      try {
        const dateObj = typeof apt.slotId.date === "string" ? parseISO(apt.slotId.date) : new Date(apt.slotId.date);
        const key = format(dateObj, "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(apt);
      } catch (e) {
        console.error("Invalid date format in appointment", apt);
      }
    });
    return map;
  }, [appointments]);

  // Selected date appointments
  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDayAppointments = appointmentsByDate[selectedKey] || [];

  // Month navigation handlers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Calendar Grid generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [startDate, endDate]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
      case "confirmed":
        return <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-200 hover:bg-sky-500/20">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 hover:bg-emerald-500/20">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 hover:bg-purple-500/20">In Progress</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 hover:bg-rose-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGoogleCalendarUrl = (apt: any) => {
    if (!apt?.slotId?.date) return "#";
    const baseDate = new Date(apt.slotId.date);
    const startStr = apt.slotId.startTime || "09:00";
    const endStr = apt.slotId.endTime || "09:30";

    const formatGDate = (d: Date, t: string) => {
      const [h, m] = t.split(":").map(Number);
      const newD = new Date(d);
      newD.setHours(h || 0, m || 0, 0, 0);
      return newD.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const title = encodeURIComponent(
      role === "doctor"
        ? `Patient Appointment: ${apt.patientId?.name || "Patient"}`
        : `Doctor Appointment: Dr. ${apt.doctorId?.name || "Doctor"}`
    );
    const details = encodeURIComponent(
      `Appointment Details:\nPatient: ${apt.patientId?.name || "N/A"}\nDoctor: Dr. ${apt.doctorId?.name || "N/A"}\nChief Complaint: ${apt.symptomForm?.chiefComplaint || "General consultation"}`
    );

    const dates = `${formatGDate(baseDate, startStr)}/${formatGDate(baseDate, endStr)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Visual Calendar View */}
      <Card className="lg:col-span-7 shadow-sm border-sky-100 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <CalendarIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            {format(currentMonth, "MMMM yyyy")}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs font-medium">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
            </div>
          ) : (
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 text-center font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const dayAppointments = appointmentsByDate[dayKey] || [];
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[74px] p-1.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between relative group
                        ${
                          !isCurrentMonth
                            ? "bg-slate-50/50 text-slate-400 border-transparent dark:bg-slate-900/30 dark:text-slate-600"
                            : isSelected
                            ? "bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 text-sky-950 dark:bg-sky-950/40 dark:border-sky-400 dark:text-slate-100 shadow-sm"
                            : isToday
                            ? "border-sky-300 bg-sky-50/30 text-sky-700 font-bold dark:border-sky-700 dark:text-sky-400"
                            : "hover:bg-slate-50 border-slate-100 dark:hover:bg-slate-800/50 dark:border-slate-800 text-slate-700 dark:text-slate-200"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`
                            text-xs font-semibold h-6 w-6 rounded-full flex items-center justify-center
                            ${
                              isToday
                                ? "bg-sky-600 text-white shadow-sm"
                                : isSelected
                                ? "bg-sky-200 text-sky-800 dark:bg-sky-800 dark:text-sky-100"
                                : ""
                            }
                          `}
                        >
                          {format(day, "d")}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className="h-2 w-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </div>

                      {/* Appointment summary indicators */}
                      {dayAppointments.length > 0 && (
                        <div className="mt-1 space-y-1 w-full overflow-hidden">
                          {dayAppointments.slice(0, 2).map((apt, i) => (
                            <div
                              key={i}
                              className={`
                                text-[10px] truncate px-1.5 py-0.5 rounded font-medium flex items-center gap-1
                                ${
                                  apt.status === "completed"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : apt.status === "cancelled"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200"
                                }
                              `}
                            >
                              <span className="font-semibold">{apt.slotId?.startTime || "--"}</span>
                              <span className="truncate">
                                {role === "doctor" ? apt.patientId?.name?.split(" ")[0] : `Dr. ${apt.doctorId?.name?.split(" ")[0]}`}
                              </span>
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-[9px] text-muted-foreground font-semibold px-1">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Day Details Panel */}
      <Card className="lg:col-span-5 shadow-sm border-sky-100 dark:border-slate-800 flex flex-col">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {format(selectedDate, "EEEE, MMM d, yyyy")}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedDayAppointments.length === 0
                  ? "No appointments scheduled"
                  : `${selectedDayAppointments.length} appointment${selectedDayAppointments.length > 1 ? "s" : ""} booked`}
              </p>
            </div>
            {isSameDay(selectedDate, new Date()) && (
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                Today
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 overflow-y-auto">
          {selectedDayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm">No scheduled appointments on this date.</p>
              {role === "patient" && (
                <Link href="/patient/doctors">
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    Book New Appointment
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayAppointments.map((apt) => {
                const googleCalUrl = getGoogleCalendarUrl(apt);
                const detailHref =
                  role === "doctor"
                    ? `/doctor/appointments/${apt._id}`
                    : `/patient/appointments/${apt._id}`;

                return (
                  <div
                    key={apt._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                          {role === "doctor" ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Stethoscope className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {role === "doctor"
                              ? apt.patientId?.name || "Patient"
                              : `Dr. ${apt.doctorId?.name || "Doctor"}`}
                          </h4>
                          {role === "patient" && apt.doctorProfile?.specialisation && (
                            <p className="text-xs text-muted-foreground">
                              {apt.doctorProfile.specialisation}
                            </p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>

                    {/* Slot Details */}
                    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-sky-600" />
                        <span className="font-medium">
                          {apt.slotId?.startTime || "--:--"} - {apt.slotId?.endTime || "--:--"}
                        </span>
                      </div>
                    </div>

                    {/* Symptom / Notes Preview */}
                    {apt.symptomForm?.chiefComplaint && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="line-clamp-2 italic">
                          &quot;{apt.symptomForm.chiefComplaint}&quot;
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200/60"
                        title="View or manage on Google Calendar"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Added to Google Calendar
                      </a>

                      <Link href={detailHref}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
