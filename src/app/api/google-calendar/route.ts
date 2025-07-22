import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import type { ApiResponse } from '@/services/api';
import { mapGoogleEventsToEvents } from '@/services/event-mapper';
import { GoogleCalendarAPI, GoogleCalendarError } from '@/services/google-api';
import type { IEvent } from '@/types/IEvent';

export async function GET(request: NextRequest) {
  console.log('Calendar API route called:', request.url);

  try {
    const session = await getServerSession(authOptions);
    console.log('Session in API route:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      hasError: !!session?.error,
      error: session?.error,
    });

    if (!session) {
      console.log('No session found');
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No session found. Please sign in.',
        },
        { status: 401 },
      );
    }

    if (session.error === 'RefreshAccessTokenError') {
      console.log('Token refresh error');
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Authentication expired. Please sign out and sign in again.',
        },
        { status: 401 },
      );
    }

    if (!session.accessToken) {
      console.log('No access token found in session');
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No access token found. Please sign out and sign in again.',
        },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startIso = searchParams.get('start');
    const endIso = searchParams.get('end');

    let rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);
    let rangeEnd = new Date();
    rangeEnd.setHours(23, 59, 59, 999);

    if (startIso && endIso) {
      const start = new Date(startIso);
      const end = new Date(endIso);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        rangeStart = start;
        rangeEnd = end;
      } else {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Invalid date range.' },
          { status: 400 },
        );
      }
    }

    console.log('Creating Google Calendar API client...');
    const api = new GoogleCalendarAPI(session.accessToken);

    console.log('Fetching events...');
    const { events, calendars } = await api.getEventsInRange(rangeStart, rangeEnd);
    console.log('Fetched events:', events.length, 'calendars:', calendars.length);

    const eventList = mapGoogleEventsToEvents(events, calendars);
    console.log('Mapped events:', eventList.length);

    return NextResponse.json<ApiResponse<IEvent[]>>({
      success: true,
      data: eventList,
    });
  } catch (error) {
    console.error('Calendar API error:', error);

    if (error instanceof GoogleCalendarError) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: error.message,
        },
        { status: error.statusCode || 500 },
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch calendar events. Please try again.',
      },
      { status: 500 },
    );
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
