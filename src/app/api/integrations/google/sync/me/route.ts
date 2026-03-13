import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { syncGoogleCalendar } from '@/features/integrations/google/calendar-sync';
import { getAuthenticatedUser } from '@/features/integrations/google/server/authenticated-user';

const UNAUTHORIZED_ERROR = 'Unauthorized';
const HTTP_UNAUTHORIZED = 401;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: UNAUTHORIZED_ERROR }, { status: HTTP_UNAUTHORIZED });
  }

  await syncGoogleCalendar(user.id);
  return NextResponse.json({ synced: true });
}
