// Server-only: exchange a Google refresh token for a short-lived access token.

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface AccessTokenResult {
  accessToken: string;
  expiry: Date;
}

export async function refreshAccessToken(refreshToken: string): Promise<AccessTokenResult> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed [${res.status}]: ${body}`);
  }

  const data = (await res.json()) as TokenResponse;
  return {
    accessToken: data.access_token,
    expiry: new Date(Date.now() + data.expires_in * 1000),
  };
}
