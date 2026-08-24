import { getValidOAuth2Client, getCalendarApi } from "./google-client";

/**
 * Create a Google Calendar event for an appointment
 */
export async function createCalendarEvent({
  tokens,
  summary,
  description,
  startDateTime,
  endDateTime,
  attendees = [],
  location = "",
  onTokenRefresh,
}) {
  try {
    const oauth2Client = await getValidOAuth2Client(tokens, onTokenRefresh);
    const calendar = getCalendarApi(oauth2Client);

    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: startDateTime,
        timeZone: process.env.TIMEZONE || "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: process.env.TIMEZONE || "Asia/Kolkata",
      },
      attendees: attendees.map((email) => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      sendUpdates: "all",
    });

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
