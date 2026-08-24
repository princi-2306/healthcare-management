"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import { ScheduleList } from "@/components/doctor/schedule-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function DoctorDashboard() {
  const { user } = useRole();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTodayAppointments() {
      try {
        const res = await fetch("/api/appointments?limit=20");
        const data = await res.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTodayAppointments();
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments.filter((a: any) => {
    if (!a.slotId?.date) return false;
    return format(new Date(a.slotId.date), "yyyy-MM-dd") === today;
  });

  const upcomingAppointments = appointments.filter((a: any) => {
    if (!["scheduled", "confirmed"].includes(a.status)) return false;
    if (!a.slotId?.date) return true;
    return format(new Date(a.slotId.date), "yyyy-MM-dd") !== today;
  });

  const scheduled = appointments.filter((a: any) =>
    ["scheduled", "confirmed"].includes(a.status)
  ).length;
  const completed = appointments.filter(
    (a: any) => a.status === "completed"
  ).length;

  const mapToScheduleItems = (list: any[]) =>
    list.map((a: any) => ({
      _id: a._id,
      slot: {
        startTime: a.slotId?.startTime || "--:--",
        endTime: a.slotId?.endTime || "--:--",
        date: a.slotId?.date ? format(new Date(a.slotId.date), "MMM d, yyyy") : "",
      },
      patient: {
        name: a.patientId?.name || "Patient",
        image: a.patientId?.image,
      },
      status: a.status,
      symptomForm: a.symptomForm,
    }));

  const todayItems = mapToScheduleItems(todayAppointments);
  const upcomingItems = mapToScheduleItems(upcomingAppointments);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, Dr.{" "}
          {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scheduled}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600" />
            </div>
          ) : (
            <ScheduleList
              items={todayItems}
              onItemClick={(id) => router.push(`/doctor/appointments/${id}`)}
              emptyMessage="No appointments scheduled for today"
            />
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600" />
            </div>
          ) : (
            <ScheduleList
              items={upcomingItems}
              onItemClick={(id) => router.push(`/doctor/appointments/${id}`)}
              showDate
              emptyMessage="No upcoming appointments booked"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

