// Server-only: sync Google Calendar events into the calendar_events Postgres table.
// PowerSync then replicates those rows to each user's local SQLite database.

import { decrypt } from '@/lib/crypto';
import { createAdminClient } from '@/lib/supabase-server';

import { refreshAccessToken } from './token';

const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1000;
const INITIAL_SYNC_PAST_DAYS = 30;
const INITIAL_SYNC_FUTURE_DAYS = 90;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const GOOGLE_CALENDAR_LIST_URL = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
const GOOGLE_CALENDARS_BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars';
const EVENT_STATUS_CANCELLED = 'cancelled';
const TABLE_GOOGLE_CONNECTIONS = 'google_connections';
const TABLE_CALENDAR_EVENTS = 'calendar_events';
const UPSERT_CONFLICT_FIELDS = 'user_id,google_event_id';
const GOOGLE_SYNC_LOG_PREFIX = '[google-sync]';
const EVENTS_SINGLE_EVENTS = 'true';
const CALENDAR_LIST_PAGE_SIZE = '250';
const EVENTS_PAGE_SIZE = '250';
const URL_PARAM_MAX_RESULTS = 'maxResults';
const URL_PARAM_SINGLE_EVENTS = 'singleEvents';
const URL_PARAM_TIME_MIN = 'timeMin';
const URL_PARAM_TIME_MAX = 'timeMax';
const URL_PARAM_PAGE_TOKEN = 'pageToken';

interface GoogleEventDateTime {
  dateTime?: string;
  date?: string;
}

interface GoogleEvent {
  id: string;
  summary?: string;
  start: GoogleEventDateTime;
  end: GoogleEventDateTime;
  status: string;
  updated: string;
}

interface EventsListResponse {
  items?: GoogleEvent[];
  nextPageToken?: string;
}

interface GoogleCalendarListItem {
  id: string;
}

interface CalendarListResponse {
  items?: GoogleCalendarListItem[];
  nextPageToken?: string;
}

interface SyncedCalendarEventRow {
  user_id: string;
  google_event_id: string;
  calendar_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  status: string;
  updated_at: string;
  deleted_at: string | null;
}

interface CalendarEventsBatch {
  calendarId: string;
  items: GoogleEvent[];
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = MAX_RETRY_ATTEMPTS): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, BASE_RETRY_DELAY_MS * 2 ** attempt));
      }
    }
  }
  throw lastError;
}

async function fetchJson<T>(url: URL, accessToken: string): Promise<T> {
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Google Calendar fetch failed [${response.status}]`);
  }

  return response.json() as Promise<T>;
}

function buildTimeWindow(): { min: string; max: string } {
  const min = new Date(Date.now() - INITIAL_SYNC_PAST_DAYS * MILLISECONDS_PER_DAY).toISOString();
  const max = new Date(Date.now() + INITIAL_SYNC_FUTURE_DAYS * MILLISECONDS_PER_DAY).toISOString();
  return { min, max };
}

async function listAccessibleCalendarIds(accessToken: string): Promise<string[]> {
  const calendarIds: string[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = new URL(GOOGLE_CALENDAR_LIST_URL);
    url.searchParams.set(URL_PARAM_MAX_RESULTS, CALENDAR_LIST_PAGE_SIZE);
    if (nextPageToken) {
      url.searchParams.set(URL_PARAM_PAGE_TOKEN, nextPageToken);
    }

    const response = await fetchJson<CalendarListResponse>(url, accessToken);
    for (const calendar of response.items ?? []) {
      calendarIds.push(calendar.id);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return Array.from(new Set(calendarIds));
}

async function fetchAllCalendarEvents(
  accessToken: string,
  calendarId: string,
): Promise<GoogleEvent[]> {
  const allItems: GoogleEvent[] = [];
  let nextPageToken: string | undefined;
  const { min, max } = buildTimeWindow();

  do {
    const encodedCalendarId = encodeURIComponent(calendarId);
    const url = new URL(`${GOOGLE_CALENDARS_BASE_URL}/${encodedCalendarId}/events`);
    url.searchParams.set(URL_PARAM_MAX_RESULTS, EVENTS_PAGE_SIZE);
    url.searchParams.set(URL_PARAM_SINGLE_EVENTS, EVENTS_SINGLE_EVENTS);

    url.searchParams.set(URL_PARAM_TIME_MIN, min);
    url.searchParams.set(URL_PARAM_TIME_MAX, max);

    if (nextPageToken) {
      url.searchParams.set(URL_PARAM_PAGE_TOKEN, nextPageToken);
    }

    const response = await fetchJson<EventsListResponse>(url, accessToken);
    allItems.push(...(response.items ?? []));
    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return allItems;
}

function mapGoogleEventToRow(
  userId: string,
  calendarId: string,
  event: GoogleEvent,
): SyncedCalendarEventRow {
  const allDay = !event.start.dateTime;
  return {
    user_id: userId,
    google_event_id: `${calendarId}:${event.id}`,
    calendar_id: calendarId,
    title: event.summary ?? '',
    starts_at: event.start.dateTime ?? event.start.date ?? '',
    ends_at: event.end.dateTime ?? event.end.date ?? '',
    all_day: allDay,
    status: event.status,
    updated_at: event.updated,
    deleted_at: event.status === EVENT_STATUS_CANCELLED ? new Date().toISOString() : null,
  };
}

export async function syncGoogleCalendar(userId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: connection, error: connectionError } = await supabase
    .from(TABLE_GOOGLE_CONNECTIONS)
    .select('refresh_token_encrypted')
    .eq('user_id', userId)
    .single();

  if (connectionError || !connection) {
    throw new Error(`No Google connection found for user ${userId}`);
  }

  const refreshToken = decrypt(connection.refresh_token_encrypted as string);
  const { accessToken } = await withRetry(() => refreshAccessToken(refreshToken));

  const calendarIds = await withRetry(() => listAccessibleCalendarIds(accessToken));
  console.info(`${GOOGLE_SYNC_LOG_PREFIX} syncing accessible calendars`, {
    userId,
    calendarsCount: calendarIds.length,
    calendarIds,
  });

  const responses: CalendarEventsBatch[] = [];

  for (const calendarId of calendarIds) {
    const items = await withRetry(() => fetchAllCalendarEvents(accessToken, calendarId));
    responses.push({ calendarId, items });
    console.info(`${GOOGLE_SYNC_LOG_PREFIX} calendar events fetched`, {
      userId,
      calendarId,
      count: items.length,
    });
  }

  const events = responses.flatMap(response =>
    response.items.map(event => ({ calendarId: response.calendarId, event })),
  );
  if (events.length > 0) {
    const rows = events.map(({ calendarId, event }) =>
      mapGoogleEventToRow(userId, calendarId, event),
    );
    const { error: upsertError } = await supabase
      .from(TABLE_CALENDAR_EVENTS)
      .upsert(rows, { onConflict: UPSERT_CONFLICT_FIELDS });

    if (upsertError) {
      throw new Error(`Event upsert failed: ${upsertError.message}`);
    }
  }
}
