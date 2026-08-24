export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  symptomForm: {
    chiefComplaint: string;
    symptoms: string[];
    duration: string;
    severity: "mild" | "moderate" | "severe" | "";
    additionalNotes: string;
  };
  preVisitSummary: {
    urgencyLevel: "low" | "medium" | "high" | "critical" | "";
    chiefComplaintSummary: string;
    suggestedQuestions: string[];
    relevantHistory: string;
    generatedAt: Date | null;
    rawLlmResponse: string;
  };
  postVisitSummary: {
    diagnosis: string;
    notes: string;
    followUpDate: Date | null;
    followUpNotes: string;
    generatedSummary: string;
    generatedAt: Date | null;
  };
  prescription: PrescriptionItem[];
  googleEventId: string | null;
  cancelledAt: Date | null;
  cancelReason: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient?: {
    _id: string;
    name: string;
    email: string;
    image: string | null;
  };
  doctor?: {
    _id: string;
    name: string;
    email: string;
    image: string | null;
  };
  slot?: {
    _id: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: string;
  };
}
