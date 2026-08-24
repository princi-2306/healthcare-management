import mongoose from "mongoose";

const MedicationReminderSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicationName: {
      type: String,
      required: [true, "Medication name is required"],
      trim: true,
    },
    dosage: {
      type: String,
      default: "",
    },
    frequency: {
      type: String,
      default: "",
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    instructions: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

MedicationReminderSchema.index({ scheduledAt: 1, sent: 1 });
MedicationReminderSchema.index({ patientId: 1 });
MedicationReminderSchema.index({ appointmentId: 1 });

export default mongoose.models.MedicationReminder ||
  mongoose.model("MedicationReminder", MedicationReminderSchema);
