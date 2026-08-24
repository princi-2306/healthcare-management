import mongoose from "mongoose";
import dbConnect from "../db";
import Slot from "../../models/Slot";
import SlotHold from "../../models/SlotHold";
import Appointment from "../../models/Appointment";
import { generatePreVisitSummaryHelper } from "../llm/pre-visit-service";
import { syncAppointmentToCalendars } from "../calendar/appointment-sync";
import { sendBookingConfirmationEmails } from "../notifications/appointment-notifications";

/**
 * Book a slot atomically using a MongoDB session transaction.
 * Ensures the slot is available, removes any hold, and creates the appointment
 * in a single atomic operation.
 */
export async function bookSlot({
  slotId,
  patientId,
  doctorId,
  symptomForm = {},
}) {
  await dbConnect();

  const session = await mongoose.startSession();

  try {
    let appointment;

    await session.withTransaction(async () => {
      // 1. Atomically update slot status to "booked"
      const slot = await Slot.findOneAndUpdate(
        {
          _id: slotId,
          status: { $in: ["available", "held"] },
        },
        { status: "booked" },
        { returnDocument: "after", session }
      );

      if (!slot) {
        throw new Error("Slot is no longer available for booking");
      }

      // 2. Remove any hold on this slot
      await SlotHold.deleteOne({ slotId }, { session });

      // 3. Create the appointment
      const [createdAppointment] = await Appointment.create(
        [
          {
            patientId,
            doctorId: doctorId || slot.doctorId,
            slotId,
            status: "scheduled",
            symptomForm,
          },
        ],
        { session }
      );

      appointment = createdAppointment;
    });

    // Trigger background generation of pre-visit AI summary, calendar sync, and confirmation emails upon booking
    if (appointment?._id) {
      generatePreVisitSummaryHelper(appointment._id.toString()).catch((err) =>
        console.error("Async pre-visit summary error:", err)
      );
      syncAppointmentToCalendars(appointment._id.toString()).catch((err) =>
        console.error("Async calendar sync error:", err)
      );
      sendBookingConfirmationEmails(appointment._id.toString()).catch((err) =>
        console.error("Async booking confirmation email error:", err)
      );
    }

    return {
      success: true,
      appointment,
    };
  } catch (error) {
    console.error("Booking failed:", error);
    return {
      success: false,
      error: error.message || "Booking failed. Please try again.",
    };
  } finally {
    await session.endSession();
  }
}
