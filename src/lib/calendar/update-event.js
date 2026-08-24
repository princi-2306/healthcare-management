import { getAuthenticatedClient, getCalendarApi } from "./google-client";

/**
 * Update a Google Calendar event (e.g., reschedule)
 */
export async function updateCalendarEvent({
  tokens,
  eventId,
  summary,
  description,
  startDateTime,
  endDateTime,
  location = "",
}) {
  try {
    const oauth2Client = getAuthenticatedClient(tokens);
    const calendar = getCalendarApi(oauth2Client);

    const event = {};
    if (summary) event.summary = summary;
    if (description) event.description = description;
    if (location) event.location = location;
    if (startDateTime) {
      event.start = {
        dateTime: startDateTime,
        timeZone: process.env.TIMEZONE || "Asia/Kolkata",
      };
    }
    if (endDateTime) {
      event.end = {
        dateTime: endDateTime,
        timeZone: process.env.TIMEZONE || "Asia/Kolkata",
      };
    }

    const response = await calendar.events.patch({
      calendarId: "primary",
      eventId,
      resource: event,
      sendUpdates: "all",
    });

    return {
      success: true,
      eventId: response.data.id,
    };
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
