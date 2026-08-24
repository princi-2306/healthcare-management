import mongoose from "mongoose";

const DoctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialisation: {
      type: String,
      required: [true, "Specialisation is required"],
      trim: true,
    },
    qualification: {
      type: String,
      default: "",
      trim: true,
    },
    experience: {
      type: Number, // years of experience
      default: 0,
    },
    bio: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    workingHours: [
      {
        dayOfWeek: {
          type: Number, // 0 = Sunday, 6 = Saturday
          required: true,
          min: 0,
          max: 6,
        },
        startTime: {
          type: String, // "09:00"
          required: true,
        },
        endTime: {
          type: String, // "17:00"
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    leaveDays: [
      {
        date: { type: Date, required: true },
        reason: { type: String, default: "" },
      },
    ],
    slotDurationMins: {
      type: Number,
      default: 30,
      min: 10,
      max: 120,
    },
    maxPatientsPerSlot: {
      type: Number,
      default: 1,
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

DoctorProfileSchema.index({ specialisation: 1 });

export default mongoose.models.DoctorProfile ||
  mongoose.model("DoctorProfile", DoctorProfileSchema);
