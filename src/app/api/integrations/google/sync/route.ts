// POST /api/integrations/google/sync
// Secured with CRON_SECRET — set as Authorization: Bearer <secret>.
// Can be called by Vercel Cron, an external scheduler, or manually.
//
// Body (optional): { "userId": "<uuid>" } — syncs a single user.
// Without a body: syncs all users who have a Google connection.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { syncGoogleCalendar } from '@/features/integrations/google/calendar-sync';
import { createAdminClient } from '@/lib/supabase-server';

const AUTHORIZATION_HEADER = 'authorization';
const BEARER_PREFIX = 'Bearer ';
const CRON_SECRET = process.env.CRON_SECRET;
const UNAUTHORIZED_ERROR = 'Unauthorized';
const HTTP_UNAUTHORIZED = 401;
const GOOGLE_CONNECTIONS_TABLE = 'google_connections';
const GOOGLE_SYNC_LOG_PREFIX = '[google-sync] sync failed for users:';

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (request.headers.get(AUTHORIZATION_HEADER) !== `${BEARER_PREFIX}${CRON_SECRET}`) {
    return NextResponse.json({ error: UNAUTHORIZED_ERROR }, { status: HTTP_UNAUTHORIZED });
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: string };

  if (body.userId) {
    await syncGoogleCalendar(body.userId);
    return NextResponse.json({ synced: 1 });
  }

  // Sync every user with an active Google connection.
  const supabase = createAdminClient();
  const { data: connections } = await supabase.from(GOOGLE_CONNECTIONS_TABLE).select('user_id');
  const userIds = (connections ?? []).map((c: { user_id: string }) => c.user_id);

  const results = await Promise.allSettled(userIds.map(uid => syncGoogleCalendar(uid)));

  const failed = results
    .map((r, i) => (r.status === 'rejected' ? userIds[i] : null))
    .filter(Boolean);

  if (failed.length > 0) {
    // TODO: replace with Sentry.captureException for each failure
    console.error(GOOGLE_SYNC_LOG_PREFIX, failed);
  }

  return NextResponse.json({ synced: userIds.length - failed.length, failed });
}
