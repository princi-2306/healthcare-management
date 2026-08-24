import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // "09:00"
      required: true,
    },
    endTime: {
      type: String, // "09:30"
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "held", "booked", "cancelled", "blocked"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to prevent duplicate slots
SlotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });
SlotSchema.index({ doctorId: 1, date: 1, status: 1 });

export default mongoose.models.Slot || mongoose.model("Slot", SlotSchema);
