"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Bell,
  UserPlus,
  ChevronRight,
  Activity,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useRole();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    pendingNotifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const doctorsRes = await fetch("/api/doctors?limit=1");
        const doctorsData = await doctorsRes.json();

        setStats({
          totalDoctors: doctorsData.pagination?.total || 0,
          totalAppointments: 0,
          pendingNotifications: 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {user?.name || "Admin"}
          </p>
        </div>
        <Link href="/admin/doctors/new">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Doctor
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalDoctors}
              </p>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalAppointments}
              </p>
              <p className="text-sm text-muted-foreground">Appointments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : stats.pendingNotifications}
              </p>
              <p className="text-sm text-muted-foreground">
                Pending Notifications
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/doctors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Doctors</h3>
                  <p className="text-sm text-muted-foreground">
                    View, edit, and manage doctor profiles
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/notifications">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Notification Logs</h3>
                  <p className="text-sm text-muted-foreground">
                    View delivery status and retry failed sends
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
