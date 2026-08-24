import dbConnect from "../db";
import Appointment from "../../models/Appointment";
import DoctorProfile from "../../models/DoctorProfile";
import NotificationLog from "../../models/NotificationLog";
import { sendWithRetry } from "../email/send-with-retry";
import { generateIcsEvent } from "../calendar/ics-generator";
import { parseSlotDateTime } from "../calendar/appointment-sync";
import {
  bookingConfirmationTemplate,
  doctorBookingConfirmationTemplate,
} from "../email/templates/booking-confirmation";
import {
  cancellationTemplate,
  doctorCancellationTemplate,
} from "../email/templates/cancellation";
import {
  reminderTemplate,
  doctorReminderTemplate,
} from "../email/templates/reminder";
import { format } from "date-fns";

/**
 * Send Booking Confirmation Emails to BOTH Patient and Doctor
 */
export async function sendBookingConfirmationEmails(appointmentId) {
  try {
    await dbConnect();

    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .populate("slotId");

    if (!appointment || !appointment.slotId) {
      console.warn("Appointment or slot not found for booking notification:", appointmentId);
      return { success: false, error: "Appointment not found" };
    }

    const { patientId: patient, doctorId: doctor, slotId: slot } = appointment;

    const doctorProfile = await DoctorProfile.findOne({ userId: doctor._id });
    const specialisation = doctorProfile?.specialisation || "General Practice";

    const formattedDate = slot.date
      ? format(new Date(slot.date), "EEEE, MMMM d, yyyy")
      : "Scheduled Date";
    const startTime = slot.startTime || "09:00";
    const endTime = slot.endTime || "09:30";
    const chiefComplaint = appointment.symptomForm?.chiefComplaint || "General Consultation";

    const startDate = parseSlotDateTime(slot.date, startTime);
    const endDate = parseSlotDateTime(slot.date, endTime);

    const icsContent = generateIcsEvent({
      appointmentId: appointment._id.toString(),
      summary: `Medical Appointment: ${patient?.name || "Patient"} & Dr. ${doctor?.name || "Doctor"}`,
      description: `Appointment with Dr. ${doctor?.name || "Doctor"} (${specialisation}). Reason: ${chiefComplaint}`,
      startDate,
      endDate,
      patientName: patient?.name,
      patientEmail: patient?.email,
      doctorName: doctor?.name,
      doctorEmail: doctor?.email,
      method: "REQUEST",
      status: "CONFIRMED",
    });

    const icalEvent = {
      filename: "appointment.ics",
      method: "REQUEST",
      content: icsContent,
    };

    const results = { patientEmailSent: false, doctorEmailSent: false };

    // 1. Send email to Patient
    if (patient?.email) {
      const patientHtml = bookingConfirmationTemplate({
        patientName: patient.name || "Patient",
        doctorName: doctor.name || "Doctor",
        specialisation,
        date: formattedDate,
        startTime,
        endTime,
      });

      const res = await sendWithRetry({
        appointmentId: appointment._id,
        recipientId: patient._id,
        to: patient.email,
        subject: `Appointment Confirmed with Dr. ${doctor.name || "Doctor"}`,
        html: patientHtml,
        type: "booking-confirmation",
        icalEvent,
      });

      if (res.success) results.patientEmailSent = true;
    }

    // 2. Send email to Doctor
    if (doctor?.email) {
      const doctorHtml = doctorBookingConfirmationTemplate({
        doctorName: doctor.name || "Doctor",
        patientName: patient.name || "Patient",
        date: formattedDate,
        startTime,
        endTime,
        chiefComplaint,
      });

      const res = await sendWithRetry({
        appointmentId: appointment._id,
        recipientId: doctor._id,
        to: doctor.email,
        subject: `New Patient Booking: ${patient.name || "Patient"} - ${formattedDate}`,
        html: doctorHtml,
        type: "doctor-booking-notification",
        icalEvent,
      });

      if (res.success) results.doctorEmailSent = true;
    }

    return { success: true, results };
  } catch (error) {
    console.error("Error sending booking confirmation emails:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Cancellation Emails to BOTH Patient and Doctor
 */
export async function sendCancellationEmails(appointmentId, cancelReason = "") {
  try {
    await dbConnect();

    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .populate("slotId");

    if (!appointment || !appointment.slotId) {
      console.warn("Appointment or slot not found for cancellation notification:", appointmentId);
      return { success: false, error: "Appointment not found" };
    }

    const { patientId: patient, doctorId: doctor, slotId: slot } = appointment;

    const formattedDate = slot.date
      ? format(new Date(slot.date), "EEEE, MMMM d, yyyy")
      : "Scheduled Date";
    const startTime = slot.startTime || "09:00";
    const endTime = slot.endTime || "09:30";
    const reasonText = cancelReason || appointment.cancelReason || "";

    const startDate = parseSlotDateTime(slot.date, startTime);
    const endDate = parseSlotDateTime(slot.date, endTime);

    const cancelIcsContent = generateIcsEvent({
      appointmentId: appointment._id.toString(),
      summary: `CANCELLED: Appointment - ${patient?.name || "Patient"} & Dr. ${doctor?.name || "Doctor"}`,
      description: `Appointment cancelled. Reason: ${reasonText}`,
      startDate,
      endDate,
      patientName: patient?.name,
      patientEmail: patient?.email,
      doctorName: doctor?.name,
      doctorEmail: doctor?.email,
      method: "CANCEL",
      status: "CANCELLED",
    });

    const cancelIcalEvent = {
      filename: "cancellation.ics",
      method: "CANCEL",
      content: cancelIcsContent,
    };

    const results = { patientEmailSent: false, doctorEmailSent: false };

    // 1. Send cancellation email to Patient
    if (patient?.email) {
      const patientHtml = cancellationTemplate({
        patientName: patient.name || "Patient",
        doctorName: doctor.name || "Doctor",
        date: formattedDate,
        startTime,
        cancelReason: reasonText,
      });

      const res = await sendWithRetry({
        appointmentId: appointment._id,
        recipientId: patient._id,
        to: patient.email,
        subject: `Appointment Cancelled: Dr. ${doctor.name || "Doctor"}`,
        html: patientHtml,
        type: "cancellation",
        icalEvent: cancelIcalEvent,
      });

      if (res.success) results.patientEmailSent = true;
    }

    // 2. Send cancellation email to Doctor
    if (doctor?.email) {
      const doctorHtml = doctorCancellationTemplate({
        doctorName: doctor.name || "Doctor",
        patientName: patient.name || "Patient",
        date: formattedDate,
        startTime,
        cancelReason: reasonText,
      });

      const res = await sendWithRetry({
        appointmentId: appointment._id,
        recipientId: doctor._id,
        to: doctor.email,
        subject: `Appointment Cancelled: Patient ${patient.name || "Patient"} - ${formattedDate}`,
        html: doctorHtml,
        type: "doctor-cancellation-notification",
        icalEvent: cancelIcalEvent,
      });

      if (res.success) results.doctorEmailSent = true;
    }

    return { success: true, results };
  } catch (error) {
    console.error("Error sending cancellation emails:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Appointment Reminder Emails to BOTH Patient and Doctor for upcoming appointments
 */
export async function sendAppointmentReminders() {
  try {
    await dbConnect();

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find upcoming scheduled appointments
    const appointments = await Appointment.find({
      status: { $in: ["scheduled", "confirmed"] },
    })
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .populate("slotId");

    const processed = [];

    for (const appointment of appointments) {
      if (!appointment.slotId || !appointment.slotId.date) continue;

      const slotDate = new Date(appointment.slotId.date);
      // Check if slot falls within next 24 hours
      if (slotDate >= now && slotDate <= next24Hours) {
        // Check if reminder was already sent
        const existingLog = await NotificationLog.findOne({
          appointmentId: appointment._id,
          type: { $in: ["reminder", "doctor-reminder"] },
          status: "sent",
        });

        if (existingLog) continue; // Skip already sent reminders

        const { patientId: patient, doctorId: doctor, slotId: slot } = appointment;
        const doctorProfile = await DoctorProfile.findOne({ userId: doctor?._id });

        const formattedDate = format(slotDate, "EEEE, MMMM d, yyyy");
        const startTime = slot.startTime || "--:--";
        const specialisation = doctorProfile?.specialisation || "General Practice";

        // Calculate hours remaining
        const hoursUntil = Math.max(
          1,
          Math.round((slotDate.getTime() - now.getTime()) / (1000 * 60 * 60))
        );

        let patientSent = false;
        let doctorSent = false;

        // 1. Patient reminder
        if (patient?.email) {
          const patientHtml = reminderTemplate({
            patientName: patient.name || "Patient",
            doctorName: doctor?.name || "Doctor",
            specialisation,
            date: formattedDate,
            startTime,
            hoursUntil,
          });

          const res = await sendWithRetry({
            appointmentId: appointment._id,
            recipientId: patient._id,
            to: patient.email,
            subject: `Reminder: Appointment with Dr. ${doctor?.name || "Doctor"} in ${hoursUntil} hours`,
            html: patientHtml,
            type: "reminder",
          });
          if (res.success) patientSent = true;
        }

        // 2. Doctor reminder
        if (doctor?.email) {
          const doctorHtml = doctorReminderTemplate({
            doctorName: doctor.name || "Doctor",
            patientName: patient?.name || "Patient",
            date: formattedDate,
            startTime,
            hoursUntil,
          });

          const res = await sendWithRetry({
            appointmentId: appointment._id,
            recipientId: doctor._id,
            to: doctor.email,
            subject: `Reminder: Patient ${patient?.name || "Patient"} appointment in ${hoursUntil} hours`,
            html: doctorHtml,
            type: "doctor-reminder",
          });
          if (res.success) doctorSent = true;
        }

        processed.push({
          appointmentId: appointment._id,
          patientSent,
          doctorSent,
        });
      }
    }

    return { success: true, processedCount: processed.length, processed };
  } catch (error) {
    console.error("Error sending appointment reminders:", error);
    return { success: false, error: error.message };
  }
}
