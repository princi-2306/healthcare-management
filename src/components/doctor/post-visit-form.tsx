"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postVisitSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Pill } from "lucide-react";
import { z } from "zod";

type PostVisitFormData = z.infer<typeof postVisitSchema>;

interface PostVisitFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<PostVisitFormData>;
}

export function PostVisitForm({
  onSubmit,
  isSubmitting = false,
  defaultValues,
}: PostVisitFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PostVisitFormData>({
    resolver: zodResolver(postVisitSchema) as any,
    defaultValues: {
      diagnosis: "",
      notes: "",
      followUpDate: null,
      followUpNotes: "",
      prescription: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescription",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post-Visit Notes & Prescription</CardTitle>
        <CardDescription>
          Record your diagnosis, notes, and any prescriptions for this appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Input
              id="diagnosis"
              placeholder="Enter diagnosis"
              {...register("diagnosis")}
            />
            {errors.diagnosis && (
              <p className="text-sm text-red-500">{errors.diagnosis.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea
              id="notes"
              placeholder="Detailed clinical notes..."
              rows={4}
              {...register("notes")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                {...register("followUpDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpNotes">Follow-up Notes</Label>
              <Input
                id="followUpNotes"
                placeholder="Follow-up instructions"
                {...register("followUpNotes")}
              />
            </div>
          </div>

          <Separator />

          {/* Prescription Builder */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescription
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    medicationName: "",
                    dosage: "",
                    frequency: "",
                    duration: "",
                    instructions: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Medication
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No medications added. Click "Add Medication" to prescribe.
              </p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">
                        Medication #{index + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Medication name *"
                      {...register(`prescription.${index}.medicationName`)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Dosage (e.g., 500mg)"
                        {...register(`prescription.${index}.dosage`)}
                      />
                      <div className="space-y-1">
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...register(`prescription.${index}.frequency`)}
                        >
                          <option value="">Select Frequency *</option>
                          <option value="once daily">Once Daily / Once a Day</option>
                          <option value="twice daily">Twice Daily / Twice a Day</option>
                          <option value="three times daily">Three Times Daily</option>
                          <option value="four times daily">Four Times Daily</option>
                          <option value="every morning">Every Morning</option>
                          <option value="every night">Every Night / At Bedtime</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Duration (e.g., 7 days)"
                        {...register(`prescription.${index}.duration`)}
                      />
                      <Input
                        placeholder="Special instructions"
                        {...register(`prescription.${index}.instructions`)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Post-Visit Notes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
