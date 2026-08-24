"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DoctorSearchFilters } from "@/components/patient/doctor-search-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Stethoscope,
  GraduationCap,
  Clock,
  IndianRupee,
  ChevronRight,
} from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialisations, setSpecialisations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialisation, setSpecialisation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (specialisation !== "all")
          params.set("specialisation", specialisation);

        const res = await fetch(`/api/doctors?${params.toString()}`);
        const data = await res.json();
        setDoctors(data.doctors || []);
        setSpecialisations(data.specialisations || []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounce = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, specialisation]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="text-muted-foreground mt-1">
          Browse our specialists and book an appointment
        </p>
      </div>

      <DoctorSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        specialisation={specialisation}
        onSpecialisationChange={setSpecialisation}
        specialisations={specialisations}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16">
          <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-muted-foreground">No doctors found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor: any) => (
            <Card
              key={doctor._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-sky-100 text-sky-700 text-lg">
                      {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">
                      Dr. {doctor.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-sky-50 text-sky-700 mt-1"
                    >
                      {doctor.profile?.specialisation}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {doctor.profile?.qualification && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {doctor.profile.qualification}
                    </div>
                  )}
                  {doctor.profile?.experience > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {doctor.profile.experience} years experience
                    </div>
                  )}
                  {doctor.profile?.consultationFee > 0 && (
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      ₹{doctor.profile.consultationFee} consultation
                    </div>
                  )}
                </div>

                <Link href={`/patient/doctors/${doctor._id}`}>
                  <Button className="w-full" variant="outline">
                    View Profile & Book
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
