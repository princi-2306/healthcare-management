/**
 * Helper to format JavaScript Date object into RFC 5545 UTC timestamp format: YYYYMMDDTHHMMSSZ
 */
function formatIcsDate(dateVal) {
  const d = new Date(dateVal);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Generate RFC 5545 iCalendar (.ics) content for email invites
 */
export function generateIcsEvent({
  appointmentId,
  summary,
  description = "Healthcare Appointment",
  location = "Hospital / Telehealth",
  startDate,
  endDate,
  patientName = "Patient",
  patientEmail,
  doctorName = "Doctor",
  doctorEmail,
  method = "REQUEST",
  status = "CONFIRMED",
}) {
  const dtStamp = formatIcsDate(new Date());
  const dtStart = formatIcsDate(startDate);
  const dtEnd = formatIcsDate(endDate);

  const cleanUid = `appointment_${appointmentId}@healthcare.app`;
  const cleanSummary = summary.replace(/\r?\n/g, " ");
  const cleanDescription = description.replace(/\r?\n/g, "\\n");

  const attendeesList = [];
  if (patientEmail) {
    attendeesList.push(
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${patientName}:MAILTO:${patientEmail}`
    );
  }
  if (doctorEmail) {
    attendeesList.push(
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Dr. ${doctorName}:MAILTO:${doctorEmail}`
    );
  }

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Healthcare Platform//NONSGML Appointment System//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${cleanUid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${location}`,
    `STATUS:${status}`,
    "ORGANIZER;CN=Healthcare Platform:MAILTO:noreply@healthcare.app",
    ...attendeesList,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
}
