import { addMinutes, format, parse, isBefore, isEqual } from "date-fns";

/**
 * Generate time slots for a doctor on a given date based on their working hours and slot duration.
 * Excludes leave days and already-booked/held slots.
 *
 * @param {Object} params
 * @param {Object} params.doctorProfile - Doctor profile with workingHours and slotDurationMins
 * @param {Date} params.date - The date to generate slots for
 * @param {Array} params.existingSlots - Already existing slots for this doctor on this date
 * @returns {Array} Generated slot objects
 */
export function generateSlots({ doctorProfile, date, existingSlots = [] }) {
  const dayOfWeek = date.getDay();
  const { workingHours, slotDurationMins, leaveDays } = doctorProfile;

  // Check if it's a leave day
  const isLeaveDay = leaveDays?.some((leave) => {
    const leaveDate = new Date(leave.date);
    return (
      leaveDate.getFullYear() === date.getFullYear() &&
      leaveDate.getMonth() === date.getMonth() &&
      leaveDate.getDate() === date.getDate()
    );
  });

  if (isLeaveDay) {
    return [];
  }

  // Find working hours for this day of week
  const todayHours = workingHours?.filter(
    (wh) => wh.dayOfWeek === dayOfWeek && wh.isActive
  );

  if (!todayHours || todayHours.length === 0) {
    return [];
  }

  // Build set of existing slot start times for quick lookup
  const existingStartTimes = new Set(
    existingSlots.map((s) => s.startTime)
  );

  const slots = [];
  const dateStr = format(date, "yyyy-MM-dd");

  for (const hours of todayHours) {
    let currentTime = parse(hours.startTime, "HH:mm", date);
    const endTime = parse(hours.endTime, "HH:mm", date);

    while (isBefore(currentTime, endTime) || isEqual(currentTime, endTime)) {
      const slotEnd = addMinutes(currentTime, slotDurationMins);

      // Don't create slot if it would extend past working hours
      if (isBefore(endTime, slotEnd)) {
        break;
      }

      const startTimeStr = format(currentTime, "HH:mm");
      const endTimeStr = format(slotEnd, "HH:mm");

      // Only add if slot doesn't already exist
      if (!existingStartTimes.has(startTimeStr)) {
        slots.push({
          date: new Date(dateStr),
          startTime: startTimeStr,
          endTime: endTimeStr,
          status: "available",
        });
      }

      currentTime = slotEnd;
    }
  }

  return slots;
}
