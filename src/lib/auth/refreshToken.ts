import axios from 'axios';
import { JWT } from 'next-auth/jwt';

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './config';

/**
 * Refresh an expired Google access token.
 * Returns the updated token or sets an error flag on failure.
 */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    console.error('Missing refresh token when attempting to refresh access token');
    return { ...token, error: 'MissingRefreshToken' };
  }

  try {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID as string,
      client_secret: GOOGLE_CLIENT_SECRET as string,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    });

    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (err) {
    console.error('Error refreshing access token', err);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}
