import mongoose from "mongoose";

const NotificationLogSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "booking-confirmation",
        "cancellation",
        "reminder",
        "reschedule",
        "medication-reminder",
        "follow-up",
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ["email", "sms", "push"],
      default: "email",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed", "bounced"],
      default: "pending",
    },
    subject: {
      type: String,
      default: "",
    },
    body: {
      type: String,
      default: "",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

NotificationLogSchema.index({ appointmentId: 1 });
NotificationLogSchema.index({ status: 1, retryCount: 1 });
NotificationLogSchema.index({ recipientId: 1, type: 1 });

export default mongoose.models.NotificationLog ||
  mongoose.model("NotificationLog", NotificationLogSchema);
