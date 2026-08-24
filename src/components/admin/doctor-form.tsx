"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorProfileSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

const createDoctorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  ...doctorProfileSchema.shape,
});

type DoctorFormData = z.infer<typeof createDoctorSchema>;

interface DoctorFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<DoctorFormData>;
  isEdit?: boolean;
}

export function DoctorForm({
  onSubmit,
  isSubmitting = false,
  defaultValues,
  isEdit = false,
}: DoctorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(isEdit ? doctorProfileSchema : createDoctorSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      specialisation: "",
      qualification: "",
      experience: 0,
      bio: "",
      phone: "",
      consultationFee: 0,
      slotDurationMins: 30,
      ...defaultValues,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Doctor" : "Add New Doctor"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!isEdit && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="Dr. John Smith" {...register("name")} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="doctor@example.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" placeholder="Min 8 characters" {...register("password")} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialisation">Specialisation *</Label>
              <Input id="specialisation" placeholder="e.g., Cardiology" {...register("specialisation")} />
              {errors.specialisation && <p className="text-sm text-red-500">{errors.specialisation.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" placeholder="e.g., MBBS, MD" {...register("qualification")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input id="experience" type="number" min={0} {...register("experience", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
              <Input id="consultationFee" type="number" min={0} {...register("consultationFee", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotDurationMins">Slot Duration (mins)</Label>
              <Input id="slotDurationMins" type="number" min={10} max={120} {...register("slotDurationMins", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+91 98765 43210" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Brief professional bio..." rows={3} {...register("bio")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Doctor" : "Create Doctor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
