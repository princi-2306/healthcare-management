import dbConnect from "../db";
import Appointment from "../../models/Appointment";
import MedicationReminder from "../../models/MedicationReminder";
import { addDays, addHours, parse, startOfDay } from "date-fns";

/**
 * Parse prescription frequency into reminder schedule.
 * Converts human-readable frequency strings into concrete reminder dates.
 */
function parseFrequencyToTimes(frequency) {
  const normalized = frequency.toLowerCase().trim();

  const scheduleMap = {
    "once daily": ["09:00"],
    "once a day": ["09:00"],
    "od": ["09:00"],
    "twice daily": ["09:00", "21:00"],
    "twice a day": ["09:00", "21:00"],
    "bd": ["09:00", "21:00"],
    "bid": ["09:00", "21:00"],
    "three times daily": ["08:00", "14:00", "20:00"],
    "three times a day": ["08:00", "14:00", "20:00"],
    "tid": ["08:00", "14:00", "20:00"],
    "tds": ["08:00", "14:00", "20:00"],
    "four times daily": ["08:00", "12:00", "16:00", "20:00"],
    "qid": ["08:00", "12:00", "16:00", "20:00"],
    "every morning": ["09:00"],
    "every night": ["21:00"],
    "at bedtime": ["22:00"],
    "hs": ["22:00"],
  };

  return scheduleMap[normalized] || ["09:00"]; // default to once daily
}

/**
 * Parse duration string to number of days
 */
function parseDurationToDays(duration) {
  if (!duration) return 7; // default 7 days

  const normalized = duration.toLowerCase().trim();
  const match = normalized.match(/(\d+)/);
  const number = match ? parseInt(match[1]) : 7;

  if (normalized.includes("week")) return number * 7;
  if (normalized.includes("month")) return number * 30;
  if (normalized.includes("day")) return number;

  return number; // assume days by default
}

/**
 * Schedule medication reminders for a completed appointment.
 * Parses prescription frequency and duration to create reminder documents.
 */
export async function scheduleMedicationReminders({ appointmentId }) {
  await dbConnect();

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || !appointment.prescription?.length) {
    return { created: 0 };
  }

  const reminders = [];
  const today = startOfDay(new Date());

  for (const med of appointment.prescription) {
    const times = parseFrequencyToTimes(med.frequency);
    const durationDays = parseDurationToDays(med.duration);

    for (let day = 0; day < durationDays; day++) {
      const currentDay = addDays(today, day);

      for (const time of times) {
        const [hours, minutes] = time.split(":").map(Number);
        const scheduledAt = new Date(currentDay);
        scheduledAt.setHours(hours, minutes, 0, 0);

        // Don't schedule past reminders
        if (scheduledAt > new Date()) {
          reminders.push({
            appointmentId,
            patientId: appointment.patientId,
            medicationName: med.medicationName,
            dosage: med.dosage || "",
            frequency: med.frequency || "",
            scheduledAt,
            instructions: med.instructions || "",
            sent: false,
          });
        }
      }
    }
  }

  if (reminders.length > 0) {
    await MedicationReminder.insertMany(reminders);
  }

  return { created: reminders.length };
}
