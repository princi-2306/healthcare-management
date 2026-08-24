import dbConnect from "../db";
import Appointment from "../../models/Appointment";
import DoctorProfile from "../../models/DoctorProfile";
import PatientProfile from "../../models/PatientProfile";
import User from "../../models/User";
import { createCalendarEvent } from "./create-event";
import { deleteCalendarEvent } from "./delete-event";

/**
 * Generate Google Calendar Add Event Web URL
 */
export function generateGoogleCalendarUrl({
  title,
  description,
  location = "Hospital / Telehealth",
  startTime,
  endTime,
}) {
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const startStr = formatTime(startTime);
  const endStr = formatTime(endTime);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location: location,
    dates: `${startStr}/${endStr}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Combine slot date (e.g. Date object or string) and slot time (e.g. "09:30" or "09:30 AM") into a Date object
 */
export function parseSlotDateTime(dateVal, timeStr) {
  if (!dateVal) return new Date();
  const baseDate = new Date(dateVal);

  if (!timeStr) return baseDate;

  // Handle "HH:MM" or "HH:MM AM/PM"
  let hours = 0;
  let minutes = 0;

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const meridiem = match[3];

    if (meridiem) {
      if (meridiem.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (meridiem.toUpperCase() === "AM" && hours === 12) hours = 0;
    }
  }

  baseDate.setHours(hours, minutes, 0, 0);
  return baseDate;
}

/**
 * Sync appointment to Google Calendar for Doctor and Patient (if tokens available)
 */
export async function syncAppointmentToCalendars(appointmentId) {
  try {
    await dbConnect();

    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .populate("slotId");

    if (!appointment || !appointment.slotId) {
      console.warn("Appointment or slot not found for calendar sync:", appointmentId);
      return { success: false, error: "Appointment or slot not found" };
    }

    const { slotId, patientId, doctorId } = appointment;

    const startDate = parseSlotDateTime(slotId.date, slotId.startTime || "09:00");
    const endDate = parseSlotDateTime(slotId.date, slotId.endTime || "09:30");

    const patientName = patientId?.name || "Patient";
    const doctorName = doctorId?.name || "Doctor";

    const summary = `Medical Appointment: ${patientName} & Dr. ${doctorName}`;
    const description = `Healthcare Appointment\n\nPatient: ${patientName} (${patientId?.email || ""})\nDoctor: Dr. ${doctorName} (${doctorId?.email || ""})\nReason/Chief Complaint: ${appointment.symptomForm?.chiefComplaint || "General Consultation"}\nStatus: ${appointment.status}`;

    const attendees = [];
    if (patientId?.email) attendees.push(patientId.email);
    if (doctorId?.email) attendees.push(doctorId.email);

    let eventId = appointment.googleEventId || null;
    let syncResults = { doctorSynced: false, patientSynced: false };

    // Fetch profiles for tokens
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId?._id });
    const patientProfile = await PatientProfile.findOne({ userId: patientId?._id });

    // 1. Try Doctor Google Calendar Sync
    if (doctorProfile?.googleCalendarTokens?.accessToken) {
      const result = await createCalendarEvent({
        tokens: doctorProfile.googleCalendarTokens,
        summary,
        description,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        attendees,
        onTokenRefresh: async (newTokens) => {
          doctorProfile.googleCalendarTokens = newTokens;
          await doctorProfile.save();
        },
      });

      if (result.success) {
        eventId = result.eventId;
        syncResults.doctorSynced = true;
      }
    }

    // 2. Try Patient Google Calendar Sync
    if (patientProfile?.googleCalendarTokens?.accessToken) {
      const result = await createCalendarEvent({
        tokens: patientProfile.googleCalendarTokens,
        summary,
        description,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        attendees,
        onTokenRefresh: async (newTokens) => {
          patientProfile.googleCalendarTokens = newTokens;
          await patientProfile.save();
        },
      });

      if (result.success) {
        if (!eventId) eventId = result.eventId;
        syncResults.patientSynced = true;
      }
    }

    if (eventId && appointment.googleEventId !== eventId) {
      appointment.googleEventId = eventId;
      await appointment.save();
    }

    // Generate web URL for fallback/manual addition
    const googleCalendarUrl = generateGoogleCalendarUrl({
      title: summary,
      description,
      startTime: startDate,
      endTime: endDate,
    });

    return {
      success: true,
      eventId,
      syncResults,
      googleCalendarUrl,
    };
  } catch (error) {
    console.error("Error syncing appointment to calendar:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete appointment Google Calendar events for Doctor and Patient
 */
export async function deleteAppointmentFromCalendars(appointmentId) {
  try {
    await dbConnect();

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || !appointment.googleEventId) {
      return { success: true, message: "No calendar event associated to delete" };
    }

    const eventId = appointment.googleEventId;

    const doctorProfile = await DoctorProfile.findOne({ userId: appointment.doctorId });
    const patientProfile = await PatientProfile.findOne({ userId: appointment.patientId });

    const results = { doctorDeleted: false, patientDeleted: false };

    if (doctorProfile?.googleCalendarTokens?.accessToken) {
      const res = await deleteCalendarEvent({
        tokens: doctorProfile.googleCalendarTokens,
        eventId,
      });
      if (res.success) results.doctorDeleted = true;
    }

    if (patientProfile?.googleCalendarTokens?.accessToken) {
      const res = await deleteCalendarEvent({
        tokens: patientProfile.googleCalendarTokens,
        eventId,
      });
      if (res.success) results.patientDeleted = true;
    }

    appointment.googleEventId = null;
    await appointment.save();

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error("Error deleting appointment from calendar:", error);
    return { success: false, error: error.message };
  }
}

