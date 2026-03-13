// GET /api/google/callback
// Google redirects here after the user authorises (or denies) access.
// URL in .env: GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { syncGoogleCalendar } from '@/features/integrations/google/calendar-sync';
import { encrypt } from '@/lib/crypto';
import { createAdminClient } from '@/lib/supabase-server';

interface TokenExchangeResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface GoogleUserInfo {
  id: string;
}

const OAUTH_NONCE_COOKIE = 'oauth_nonce';
const CALLBACK_PATH = '/';
const OAUTH_ERROR_PARAM = 'error';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_CONNECTIONS_TABLE = 'google_connections';
const GOOGLE_CONNECTIONS_CONFLICT = 'user_id,provider_account_id';
const GOOGLE_SYNC_LOG_PREFIX = '[google-sync] initial sync failed';
const CALLBACK_LOG_PREFIX = '[google-callback] failed';
const AUTHORIZATION_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer ';

const CALLBACK_ERROR = {
  oauthFailed: 'oauth_failed',
  invalidState: 'invalid_state',
  stateMismatch: 'state_mismatch',
  tokenExchangeFailed: 'token_exchange_failed',
  profileFetchFailed: 'profile_fetch_failed',
  connectionSaveFailed: 'connection_save_failed',
  callbackFailed: 'callback_failed',
  noRefreshToken: 'no_refresh_token',
  successConnected: 'google_connected',
} as const;

function buildSettingsRedirect(
  requestOrigin: string,
  searchKey: 'error' | 'success',
  value: string,
): URL {
  return new URL(`${CALLBACK_PATH}?${searchKey}=${value}`, requestOrigin);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const requestOrigin = request.nextUrl.origin;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');

  const cookieStore = await cookies();
  const savedNonce = cookieStore.get(OAUTH_NONCE_COOKIE)?.value;
  cookieStore.delete(OAUTH_NONCE_COOKIE);

  if (oauthError || !code || !state || !savedNonce) {
    return NextResponse.redirect(
      buildSettingsRedirect(requestOrigin, OAUTH_ERROR_PARAM, CALLBACK_ERROR.oauthFailed),
    );
  }

  // Decode and validate state – ensures the request originated from our start endpoint.
  let userId: string;
  let nonce: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
      userId: string;
      nonce: string;
    };
    userId = decoded.userId;
    nonce = decoded.nonce;
  } catch {
    return NextResponse.redirect(
      buildSettingsRedirect(requestOrigin, OAUTH_ERROR_PARAM, CALLBACK_ERROR.invalidState),
    );
  }

  if (nonce !== savedNonce) {
    return NextResponse.redirect(
      buildSettingsRedirect(requestOrigin, OAUTH_ERROR_PARAM, CALLBACK_ERROR.stateMismatch),
    );
  }

  try {
    // Exchange authorization code for tokens.
    const tokenParams = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(
        buildSettingsRedirect(requestOrigin, OAUTH_ERROR_PARAM, CALLBACK_ERROR.tokenExchangeFailed),
      );
    }

    const tokens = (await tokenRes.json()) as TokenExchangeResponse;

    // Google only sends refresh_token on the first authorisation (prompt=consent ensures this).
    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        buildSettingsRedirect(requestOrigin, OAUTH_ERROR_PARAM, CALLBACK_ERROR.noRefreshToken),
      );
    }

    // Fetch the user's Google account ID to deduplicate connections.
    const profileRes = await fetch(GOOGLE_USER_INFO_URL, {
      headers: { [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(
        buildSettingsRedirect(requestOrigin, OAUTH_ERROR_PARAM, CALLBACK_ERROR.profileFetchFailed),
      );
    }

    const profile = (await profileRes.json()) as GoogleUserInfo;

    const supabase = createAdminClient();
    const { error: saveError } = await supabase.from(GOOGLE_CONNECTIONS_TABLE).upsert(
      {
        user_id: userId,
        provider_account_id: profile.id,
        refresh_token_encrypted: encrypt(tokens.refresh_token),
        token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: GOOGLE_CONNECTIONS_CONFLICT },
    );

    if (saveError) {
      console.error('[google-callback] failed to save connection', saveError);
      return NextResponse.redirect(
        buildSettingsRedirect(requestOrigin, OAUTH_ERROR_PARAM, CALLBACK_ERROR.connectionSaveFailed),
      );
    }

    // Complete initial sync before redirect so local data is available immediately.
    try {
      await syncGoogleCalendar(userId);
    } catch (error) {
      console.error(GOOGLE_SYNC_LOG_PREFIX, error);
      // TODO: replace with Sentry.captureException(error)
    }

    return NextResponse.redirect(
      buildSettingsRedirect(requestOrigin, 'success', CALLBACK_ERROR.successConnected),
    );
  } catch (error) {
    console.error(CALLBACK_LOG_PREFIX, error);
    return NextResponse.redirect(
      buildSettingsRedirect(requestOrigin, OAUTH_ERROR_PARAM, CALLBACK_ERROR.callbackFailed),
    );
  }
}
