"use client";

import { useEffect, useState } from "react";
import { AppointmentCard } from "@/components/patient/appointment-card";
import { AppointmentCalendar } from "@/components/shared/appointment-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, ListFilter } from "lucide-react";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    async function fetchAppointments() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/appointments?limit=100");
        const data = await res.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter(
    (a: any) => ["scheduled", "confirmed"].includes(a.status)
  );
  const past = appointments.filter(
    (a: any) => ["completed", "cancelled", "no-show"].includes(a.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-muted-foreground mt-1">
          View your interactive calendar and manage your scheduled appointments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <ListFilter className="h-4 w-4" />
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <AppointmentCalendar
            appointments={appointments}
            role="patient"
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">
                No upcoming appointments
              </p>
            </div>
          ) : (
            upcoming.map((apt: any) => (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                doctor={apt.doctorId}
                doctorProfile={apt.doctorProfile}
                slot={apt.slotId}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600" />
            </div>
          ) : past.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past appointments</p>
            </div>
          ) : (
            past.map((apt: any) => (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                doctor={apt.doctorId}
                doctorProfile={apt.doctorProfile}
                slot={apt.slotId}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

