"use client";

import { useEffect, useState } from "react";
import { AppointmentCalendar } from "@/components/shared/appointment-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

export default function DoctorSchedulePage() {
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [profRes, apptRes] = await Promise.all([
          fetch("/api/doctors/me"),
          fetch("/api/appointments?limit=100"),
        ]);
        const profData = await profRes.json();
        const apptData = await apptRes.json();

        setProfile(profData.doctor?.profile);
        setAppointments(apptData.appointments || []);
      } catch (err) {
        console.error("Failed to fetch doctor schedule data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const workingHours = profile?.workingHours || [];
  const leaveDays = profile?.leaveDays || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Schedule & Appointments</h1>
        <p className="text-muted-foreground mt-1">
          Interactive monthly calendar of patient appointments, working hours, and scheduled leaves
        </p>
      </div>

      {/* Interactive Visual Doctor Calendar */}
      <div>
        <AppointmentCalendar
          appointments={appointments}
          role="doctor"
          isLoading={isLoading}
        />
      </div>

      {/* Working Hours & Leave Days Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-600" />
              Configured Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600" />
              </div>
            ) : (
              <div className="space-y-3">
                {DAYS.map((day, dayIndex) => {
                  const shifts = workingHours.filter(
                    (wh: any) => wh.dayOfWeek === dayIndex && wh.isActive
                  );

                  return (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card gap-2 text-sm"
                    >
                      <span className="font-medium text-gray-800">{day}</span>

                      {shifts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {shifts.map((shift: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                              {shift.startTime} - {shift.endTime}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500 w-fit">
                          Day Off
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Scheduled Leave Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
              </div>
            ) : leaveDays.length > 0 ? (
              <div className="space-y-2">
                {leaveDays.map((leave: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">
                        {format(new Date(leave.date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    {leave.reason && (
                      <span className="text-xs text-amber-700 italic">
                        {leave.reason}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming leave days currently scheduled by administrator.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
