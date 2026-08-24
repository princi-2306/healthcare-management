import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["patient", "doctor", "admin"]).optional().default("patient"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Symptom Form ──────────────────────────────────────────
export const symptomFormSchema = z.object({
  chiefComplaint: z.string().min(3, "Please describe your main complaint"),
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom"),
  duration: z.string().min(1, "Please specify how long you've had these symptoms"),
  severity: z.enum(["mild", "moderate", "severe"]),
  additionalNotes: z.string().optional().default(""),
});

// ── Doctor Profile ────────────────────────────────────────
export const workingHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
  isActive: z.boolean().default(true),
});

export const doctorProfileSchema = z.object({
  specialisation: z.string().min(2, "Specialisation is required"),
  qualification: z.string().optional().default(""),
  experience: z.number().min(0).optional().default(0),
  bio: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  consultationFee: z.number().min(0).optional().default(0),
  slotDurationMins: z.number().min(10).max(120).optional().default(30),
  workingHours: z.array(workingHoursSchema).optional().default([]),
});

// ── Prescription ──────────────────────────────────────────
export const prescriptionItemSchema = z.object({
  medicationName: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional().default(""),
  frequency: z.string().optional().default(""),
  duration: z.string().optional().default(""),
  instructions: z.string().optional().default(""),
});

export const prescriptionSchema = z.array(prescriptionItemSchema);

// ── Post-Visit ────────────────────────────────────────────
export const postVisitSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().optional().default(""),
  followUpDate: z.string().optional().nullable(),
  followUpNotes: z.string().optional().default(""),
  prescription: prescriptionSchema.optional().default([]),
});

// ── Booking ───────────────────────────────────────────────
export const bookingSchema = z.object({
  slotId: z.string().min(1, "Slot ID is required"),
  symptomForm: symptomFormSchema,
});

// ── Leave Day ─────────────────────────────────────────────
export const leaveDaySchema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().optional().default(""),
});
