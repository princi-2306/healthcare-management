import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    symptomForm: {
      chiefComplaint: { type: String, default: "" },
      symptoms: [{ type: String }],
      duration: { type: String, default: "" },
      severity: {
        type: String,
        enum: ["mild", "moderate", "severe", "Mild", "Moderate", "Severe", "MILD", "MODERATE", "SEVERE", ""],
        set: (v) => (v ? String(v).toLowerCase() : ""),
        default: "",
      },
      additionalNotes: { type: String, default: "" },
    },
    preVisitSummary: {
      urgencyLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical", "Low", "Medium", "High", "Critical", "LOW", "MEDIUM", "HIGH", "CRITICAL", ""],
        set: (v) => (v ? String(v).toLowerCase() : ""),
        default: "",
      },
      chiefComplaintSummary: { type: String, default: "" },
      suggestedQuestions: [{ type: String }],
      relevantHistory: { type: String, default: "" },
      generatedAt: { type: Date, default: null },
      rawLlmResponse: { type: String, default: "" },
    },
    postVisitSummary: {
      diagnosis: { type: String, default: "" },
      notes: { type: String, default: "" },
      followUpDate: { type: Date, default: null },
      followUpNotes: { type: String, default: "" },
      generatedSummary: { type: String, default: "" },
      generatedAt: { type: Date, default: null },
    },
    prescription: [
      {
        medicationName: { type: String, required: true },
        dosage: { type: String, default: "" },
        frequency: { type: String, default: "" },
        duration: { type: String, default: "" },
        instructions: { type: String, default: "" },
      },
    ],
    googleEventId: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index({ patientId: 1, status: 1 });
AppointmentSchema.index({ doctorId: 1, status: 1 });
AppointmentSchema.index({ slotId: 1 }, { unique: true });

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);
