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
const EVENTS_SINGLE_EVENTS = 'true';
const CALENDAR_LIST_PAGE_SIZE = '250';
const EVENTS_PAGE_SIZE = '250';
const URL_PARAM_MAX_RESULTS = 'maxResults';
const URL_PARAM_SINGLE_EVENTS = 'singleEvents';
const URL_PARAM_TIME_MIN = 'timeMin';
const URL_PARAM_TIME_MAX = 'timeMax';
const URL_PARAM_PAGE_TOKEN = 'pageToken';
const DEFAULT_CALENDAR_COLOR = '#9aa0a6';
const ISO_DATE_SUFFIX = 'T12:00:00.000Z';
const MISSING_EVENTS_UPDATE_CHUNK_SIZE = 500;

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
  backgroundColor?: string;
}

interface CalendarListResponse {
  items?: GoogleCalendarListItem[];
  nextPageToken?: string;
}

interface SyncedCalendarEventRow {
  user_id: string;
  google_event_id: string;
  calendar_id: string;
  calendar_color: string;
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
  calendarColor: string;
  items: GoogleEvent[];
}

interface AccessibleCalendar {
  id: string;
  color: string;
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

async function listAccessibleCalendars(accessToken: string): Promise<AccessibleCalendar[]> {
  const calendars: AccessibleCalendar[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = new URL(GOOGLE_CALENDAR_LIST_URL);
    url.searchParams.set(URL_PARAM_MAX_RESULTS, CALENDAR_LIST_PAGE_SIZE);
    if (nextPageToken) {
      url.searchParams.set(URL_PARAM_PAGE_TOKEN, nextPageToken);
    }

    const response = await fetchJson<CalendarListResponse>(url, accessToken);
    for (const calendar of response.items ?? []) {
      calendars.push({
        id: calendar.id,
        color: calendar.backgroundColor ?? DEFAULT_CALENDAR_COLOR,
      });
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  const uniqueById = new Map<string, AccessibleCalendar>();
  for (const calendar of calendars) {
    if (!uniqueById.has(calendar.id)) {
      uniqueById.set(calendar.id, calendar);
    }
  }

  return Array.from(uniqueById.values());
}

function toAllDayIso(date: string | undefined): string {
  if (!date) {
    return '';
  }

  return `${date}${ISO_DATE_SUFFIX}`;
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
  calendarColor: string,
  event: GoogleEvent,
): SyncedCalendarEventRow {
  const allDay = !event.start.dateTime;
  return {
    user_id: userId,
    google_event_id: `${calendarId}:${event.id}`,
    calendar_id: calendarId,
    calendar_color: calendarColor,
    title: event.summary ?? '',
    starts_at: allDay ? toAllDayIso(event.start.date) : (event.start.dateTime ?? ''),
    ends_at: allDay ? toAllDayIso(event.end.date) : (event.end.dateTime ?? ''),
    all_day: allDay,
    status: event.status,
    updated_at: event.updated,
    deleted_at: event.status === EVENT_STATUS_CANCELLED ? new Date().toISOString() : null,
  };
}

async function markMissingEventsAsDeleted(
  userId: string,
  batches: CalendarEventsBatch[],
): Promise<void> {
  if (batches.length === 0) {
    return;
  }

  const supabase = createAdminClient();
  const calendarIds = batches.map(batch => batch.calendarId);
  const fetchedEventIds = new Set(
    batches.flatMap(batch => batch.items.map(item => `${batch.calendarId}:${item.id}`)),
  );

  const { data: existingRows, error: existingRowsError } = await supabase
    .from(TABLE_CALENDAR_EVENTS)
    .select('google_event_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .in('calendar_id', calendarIds);

  if (existingRowsError) {
    throw new Error(`Failed to read existing events: ${existingRowsError.message}`);
  }

  const missingGoogleEventIds = (existingRows ?? [])
    .map((row: { google_event_id: string }) => row.google_event_id)
    .filter(googleEventId => !fetchedEventIds.has(googleEventId));

  if (missingGoogleEventIds.length === 0) {
    return;
  }

  const nowIso = new Date().toISOString();
  for (let index = 0; index < missingGoogleEventIds.length; index += MISSING_EVENTS_UPDATE_CHUNK_SIZE) {
    const chunk = missingGoogleEventIds.slice(index, index + MISSING_EVENTS_UPDATE_CHUNK_SIZE);
    const { error: deleteError } = await supabase
      .from(TABLE_CALENDAR_EVENTS)
      .update({
        deleted_at: nowIso,
        status: EVENT_STATUS_CANCELLED,
        updated_at: nowIso,
      })
      .eq('user_id', userId)
      .in('google_event_id', chunk);

    if (deleteError) {
      throw new Error(`Failed to soft-delete missing events: ${deleteError.message}`);
    }
  }
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

  const calendars = await withRetry(() => listAccessibleCalendars(accessToken));

  const responses: CalendarEventsBatch[] = [];

  for (const calendar of calendars) {
    const calendarId = calendar.id;
    const items = await withRetry(() => fetchAllCalendarEvents(accessToken, calendarId));
    responses.push({ calendarId, calendarColor: calendar.color, items });
  }

  const events = responses.flatMap(response =>
    response.items.map(event => ({ calendarId: response.calendarId, event })),
  );
  const calendarColorById = new Map(
    responses.map(response => [response.calendarId, response.calendarColor]),
  );
  if (events.length > 0) {
    const rows = events.map(({ calendarId, event }) =>
      mapGoogleEventToRow(
        userId,
        calendarId,
        calendarColorById.get(calendarId) ?? DEFAULT_CALENDAR_COLOR,
        event,
      ),
    );
    const { error: upsertError } = await supabase
      .from(TABLE_CALENDAR_EVENTS)
      .upsert(rows, { onConflict: UPSERT_CONFLICT_FIELDS });

    if (upsertError) {
      throw new Error(`Event upsert failed: ${upsertError.message}`);
    }
  }

  await markMissingEventsAsDeleted(userId, responses);
}
