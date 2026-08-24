import dbConnect from "../db";
import Appointment from "../../models/Appointment";
import Slot from "../../models/Slot";
import DoctorProfile from "../../models/DoctorProfile";
import User from "../../models/User";
import { sendWithRetry } from "../email/send-with-retry";
import { cancellationTemplate } from "../email/templates/cancellation";
import { format } from "date-fns";

/**
 * Handle leave day conflicts.
 * When a doctor marks a leave day, this job:
 * 1. Finds all booked appointments on that day
 * 2. Cancels them
 * 3. Notifies affected patients
 */
export async function handleLeaveConflicts({ doctorId, leaveDate }) {
  await dbConnect();

  const startOfDay = new Date(leaveDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(leaveDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Find all slots for this doctor on the leave date
  const affectedSlots = await Slot.find({
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["available", "held", "booked"] },
  });

  const slotIds = affectedSlots.map((s) => s._id);

  // Cancel all appointments for affected slots
  const affectedAppointments = await Appointment.find({
    slotId: { $in: slotIds },
    status: { $in: ["scheduled", "confirmed"] },
  }).populate("patientId", "name email");

  const doctor = await User.findById(doctorId);
  const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });

  const results = [];

  for (const appointment of affectedAppointments) {
    // Cancel the appointment
    await Appointment.findByIdAndUpdate(appointment._id, {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: "Doctor unavailable - leave day",
    });

    // Cancel the slot
    await Slot.findByIdAndUpdate(appointment.slotId, { status: "cancelled" });

    // Notify patient
    const slot = affectedSlots.find(
      (s) => s._id.toString() === appointment.slotId.toString()
    );

    if (appointment.patientId?.email) {
      await sendWithRetry({
        appointmentId: appointment._id,
        recipientId: appointment.patientId._id,
        to: appointment.patientId.email,
        subject: "Appointment Cancelled - Doctor Unavailable",
        html: cancellationTemplate({
          patientName: appointment.patientId.name,
          doctorName: doctor?.name || "Your Doctor",
          date: format(new Date(leaveDate), "MMMM d, yyyy"),
          startTime: slot?.startTime || "",
          cancelReason: "Doctor is unavailable on this date. Please reschedule.",
        }),
        type: "cancellation",
      });
    }

    results.push({
      appointmentId: appointment._id,
      patientId: appointment.patientId?._id,
      status: "cancelled",
    });
  }

  // Block remaining available slots
  await Slot.updateMany(
    {
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: "available",
    },
    { status: "blocked" }
  );

  return { cancelled: results.length, results };
}
