"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface DoctorSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  specialisation: string;
  onSpecialisationChange: (value: string) => void;
  specialisations: string[];
}

export function DoctorSearchFilters({
  searchQuery,
  onSearchChange,
  specialisation,
  onSpecialisationChange,
  specialisations,
}: DoctorSearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Label htmlFor="search" className="sr-only">Search doctors</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by doctor name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="w-full sm:w-64">
        <Label htmlFor="specialisation" className="sr-only">Specialisation</Label>
        <Select value={specialisation} onValueChange={(val) => onSpecialisationChange(val || "all")}>
          <SelectTrigger id="specialisation">
            <SelectValue placeholder="All Specialisations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialisations</SelectItem>
            {specialisations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
