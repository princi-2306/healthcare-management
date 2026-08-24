import mongoose from "mongoose";

const SlotHoldSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic cleanup when hold expires
SlotHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SlotHoldSchema.index({ slotId: 1 }, { unique: true });
SlotHoldSchema.index({ patientId: 1 });

export default mongoose.models.SlotHold ||
  mongoose.model("SlotHold", SlotHoldSchema);
