"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { symptomFormSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

type SymptomFormData = z.infer<typeof symptomFormSchema>;

interface SymptomFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea",
  "Body Aches", "Sore Throat", "Shortness of Breath",
  "Dizziness", "Chest Pain", "Back Pain", "Abdominal Pain",
  "Joint Pain", "Skin Rash", "Insomnia",
];

export function SymptomForm({ onSubmit, isSubmitting = false }: SymptomFormProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SymptomFormData>({
    resolver: zodResolver(symptomFormSchema) as any,
    defaultValues: {
      chiefComplaint: "",
      symptoms: [],
      duration: "",
      severity: "mild",
      additionalNotes: "",
    },
  });

  const toggleSymptom = (symptom: string) => {
    const updated = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom];
    setSelectedSymptoms(updated);
    setValue("symptoms", updated);
  };

  const removeSymptom = (symptom: string) => {
    const updated = selectedSymptoms.filter((s) => s !== symptom);
    setSelectedSymptoms(updated);
    setValue("symptoms", updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptom Information</CardTitle>
        <CardDescription>
          Please describe your symptoms to help the doctor prepare for your visit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
            <Input
              id="chiefComplaint"
              placeholder="What is your main reason for visiting?"
              {...register("chiefComplaint")}
            />
            {errors.chiefComplaint && (
              <p className="text-sm text-red-500">{errors.chiefComplaint.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Symptoms *</Label>
            {selectedSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSymptoms.map((symptom) => (
                  <Badge key={symptom} variant="secondary" className="gap-1">
                    {symptom}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSymptom(symptom)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <Button
                  key={symptom}
                  type="button"
                  variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                </Button>
              ))}
            </div>
            {errors.symptoms && (
              <p className="text-sm text-red-500">{errors.symptoms.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                placeholder="e.g., 3 days, 1 week"
                {...register("duration")}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select
                defaultValue="mild"
                onValueChange={(value) =>
                  setValue("severity", value as "mild" | "moderate" | "severe")
                }
              >
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any other information you'd like the doctor to know..."
              rows={4}
              {...register("additionalNotes")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit & Confirm Booking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
