import { google } from "googleapis";

/**
 * Create an OAuth2 client for Google Calendar API
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Get an authenticated OAuth2 client with stored tokens
 */
export function getAuthenticatedClient(tokens) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiresAt ? new Date(tokens.expiresAt).getTime() : undefined,
  });
  return oauth2Client;
}

/**
 * Get an authenticated OAuth2 client with auto-refresh if access token is expired
 */
export async function getValidOAuth2Client(tokens, onTokenRefresh) {
  const oauth2Client = getAuthenticatedClient(tokens);

  const expiresAtMs = tokens.expiresAt ? new Date(tokens.expiresAt).getTime() : 0;
  const nowMs = Date.now();

  // If token is expired or expires within 5 minutes, refresh it
  if (tokens.refreshToken && (expiresAtMs === 0 || expiresAtMs - nowMs < 5 * 60 * 1000)) {
    try {
      const { token: newAccessToken, res } = await oauth2Client.getAccessToken();
      if (newAccessToken) {
        const newExpiry = res?.data?.expiry_date
          ? new Date(res.data.expiry_date)
          : new Date(Date.now() + 3600 * 1000);

        const updatedTokens = {
          accessToken: newAccessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: newExpiry,
        };

        oauth2Client.setCredentials({
          access_token: newAccessToken,
          refresh_token: tokens.refreshToken,
          expiry_date: newExpiry.getTime(),
        });

        if (onTokenRefresh) {
          await onTokenRefresh(updatedTokens);
        }
      }
    } catch (err) {
      console.error("Failed to refresh Google OAuth token:", err);
    }
  }

  return oauth2Client;
}

/**
 * Get the Google Calendar API instance
 */
export function getCalendarApi(oauth2Client) {
  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Generate the authorization URL for Google Calendar access
 */
export function getAuthUrl(state) {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state,
    prompt: "consent",
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
  };
}
