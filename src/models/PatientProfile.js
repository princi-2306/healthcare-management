import mongoose from "mongoose";

const PatientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
      default: "prefer-not-to-say",
    },
    address: {
      type: String,
      default: "",
    },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relationship: { type: String, default: "" },
    },
    medicalHistory: [
      {
        condition: { type: String, required: true },
        diagnosedDate: { type: Date },
        notes: { type: String, default: "" },
        current: { type: Boolean, default: true },
      },
    ],
    allergies: [{ type: String }],
    currentMedications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: "" },
        frequency: { type: String, default: "" },
      },
    ],
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
      default: "",
    },
    insuranceInfo: {
      provider: { type: String, default: "" },
      policyNumber: { type: String, default: "" },
    },
    googleCalendarTokens: {
      accessToken: { type: String, default: null },
      refreshToken: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PatientProfile ||
  mongoose.model("PatientProfile", PatientProfileSchema);
