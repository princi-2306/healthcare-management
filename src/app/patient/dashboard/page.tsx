"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Stethoscope,
  ChevronRight,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

export default function PatientDashboard() {
  const { user } = useRole();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch("/api/appointments?limit=5&status=scheduled");
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your upcoming appointments
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/patient/doctors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                <Stethoscope className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h3 className="font-semibold">Find a Doctor</h3>
                <p className="text-sm text-muted-foreground">
                  Browse by specialisation
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/appointments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">My Appointments</h3>
                <p className="text-sm text-muted-foreground">
                  View all appointments
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Health Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Update your records
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
          <Link href="/patient/appointments">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">
                No upcoming appointments
              </p>
              <Link href="/patient/doctors">
                <Button variant="outline" className="mt-4">
                  Book an Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt: any) => (
                <Link
                  key={apt._id}
                  href={`/patient/appointments/${apt._id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold text-sky-600">
                        {apt.slotId?.startTime || "--:--"}
                      </p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Dr. {apt.doctorId?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {apt.slotId?.date
                          ? format(new Date(apt.slotId.date), "MMM d, yyyy")
                          : "Date TBD"}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {apt.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
