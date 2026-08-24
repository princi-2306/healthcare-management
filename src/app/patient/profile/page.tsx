"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/use-role";
import { User, Mail, Shield } from "lucide-react";
import { GoogleCalendarCard } from "@/components/shared/google-calendar-card";

export default function PatientProfilePage() {
  const { user, role } = useRole();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and health information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{role || "Patient"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <GoogleCalendarCard />
    </div>
  );
}
