import { getValidOAuth2Client, getCalendarApi } from "./google-client";

/**
 * Delete a Google Calendar event (e.g., on appointment cancellation)
 */
export async function deleteCalendarEvent({ tokens, eventId, onTokenRefresh }) {
  try {
    const oauth2Client = await getValidOAuth2Client(tokens, onTokenRefresh);
    const calendar = getCalendarApi(oauth2Client);

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all",
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
