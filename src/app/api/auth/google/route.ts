// POST /api/auth/google/start
// Client sends Authorization: Bearer <supabase-access-token>.
// Returns { url } — the Google OAuth URL the client should navigate to.

import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase-server';

const AUTHORIZATION_HEADER = 'authorization';
const BEARER_PREFIX = 'Bearer ';
const UNAUTHORIZED_ERROR = 'Unauthorized';
const HTTP_UNAUTHORIZED = 401;
const OAUTH_NONCE_COOKIE = 'oauth_nonce';
const NONCE_BYTE_LENGTH = 16;
const NONCE_COOKIE_MAX_AGE_SECONDS = 600;
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_RESPONSE_TYPE = 'code';
const GOOGLE_ACCESS_TYPE = 'offline';
const GOOGLE_PROMPT = 'consent';
const GOOGLE_CONNECTIONS_TABLE = 'google_connections';

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get(AUTHORIZATION_HEADER);
  return authHeader?.startsWith(BEARER_PREFIX) ? authHeader.slice(BEARER_PREFIX.length) : null;
}

async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string } | null> {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const supabase = createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return { id: user.id };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: UNAUTHORIZED_ERROR }, { status: HTTP_UNAUTHORIZED });
  }

  const supabase = createAdminClient();
  const { data: connection, error } = await supabase
    .from(GOOGLE_CONNECTIONS_TABLE)
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connected: Boolean(connection) });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: UNAUTHORIZED_ERROR }, { status: HTTP_UNAUTHORIZED });
  }

  // State = base64url-encoded {userId, nonce}; nonce is stored in httpOnly cookie
  // to prevent CSRF — the callback validates state.nonce === cookie.
  const nonce = randomBytes(NONCE_BYTE_LENGTH).toString('hex');
  const state = Buffer.from(JSON.stringify({ userId: user.id, nonce })).toString('base64url');

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: NONCE_COOKIE_MAX_AGE_SECONDS,
    path: '/',
  });

  const url = new URL(GOOGLE_OAUTH_URL);
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
  url.searchParams.set('response_type', GOOGLE_RESPONSE_TYPE);
  url.searchParams.set('scope', process.env.GOOGLE_SCOPES!);
  url.searchParams.set('access_type', GOOGLE_ACCESS_TYPE);
  url.searchParams.set('prompt', GOOGLE_PROMPT);
  url.searchParams.set('state', state);

  return NextResponse.json({ url: url.toString() });
}
