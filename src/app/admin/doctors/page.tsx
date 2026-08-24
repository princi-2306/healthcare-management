"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserPlus,
  Edit,
  CalendarOff,
  Trash2,
  Stethoscope,
} from "lucide-react";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch("/api/doctors?limit=100");
        const data = await res.json();
        setDoctors(data.doctors || []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Dr. ${name}?`)) return;

    try {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDoctors((prev) => prev.filter((d) => d._id !== id));
      } else {
        alert("Failed to delete doctor");
      }
    } catch {
      alert("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, and manage doctor profiles
          </p>
        </div>
        <Link href="/admin/doctors/new">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Doctor
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16">
          <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-muted-foreground">No doctors added yet</p>
          <Link href="/admin/doctors/new">
            <Button className="mt-4 gap-2">
              <UserPlus className="h-4 w-4" />
              Add First Doctor
            </Button>
          </Link>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialisation</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Slot Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor: any) => (
                  <TableRow key={doctor._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-sky-100 text-sky-700">
                            {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Dr. {doctor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-sky-50 text-sky-700">
                        {doctor.profile?.specialisation || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doctor.profile?.experience
                        ? `${doctor.profile.experience} yrs`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {doctor.profile?.consultationFee
                        ? `₹${doctor.profile.consultationFee}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {doctor.profile?.slotDurationMins
                        ? `${doctor.profile.slotDurationMins} min`
                        : "30 min"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/doctors/${doctor._id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/doctors/${doctor._id}/leave`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <CalendarOff className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() =>
                            handleDelete(doctor._id, doctor.name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
