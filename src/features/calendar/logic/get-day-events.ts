import { db } from '@/db/powersync';
import type { CalendarEvent } from '@/features/calendar/types/calendar-event';
import {
  type CalendarEventRow,
  mapCalendarEventRow,
} from '@/features/calendar/types/calendar-event-row';

interface DayRange {
  dayStartIso: string;
  dayEndIso: string;
}

const CALENDAR_UI_LOG_PREFIX = '[calendar-ui]';
const EVENTS_QUERY_TIMEOUT_MS = 5000;
const STREAM_EVENTS_TABLE = 'calendar_events';
const STREAM_EVENTS_SOURCE = 'google';

function getTimeoutError(): Error {
  return new Error(`events query timeout after ${EVENTS_QUERY_TIMEOUT_MS}ms`);
}

function getDayEventsQuery(): string {
  return `
    SELECT
      id,
      title,
      starts_at AS "startsAt",
      ends_at AS "endsAt",
      all_day AS "allDay",
      calendar_id AS "calendarId",
      '${STREAM_EVENTS_SOURCE}' AS source
    FROM ${STREAM_EVENTS_TABLE}
    WHERE starts_at < ? AND ends_at > ? AND deleted_at IS NULL
    ORDER BY starts_at ASC
  `;
}

async function getDayEventRows(range: DayRange): Promise<CalendarEventRow[]> {
  const query = db.getAll<CalendarEventRow>(
    getDayEventsQuery(),
    [range.dayEndIso, range.dayStartIso],
  );

  let timeoutId: number | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(getTimeoutError()), EVENTS_QUERY_TIMEOUT_MS);
  });

  try {
    const rows = await Promise.race([query, timeout]);
    return rows;
  } finally {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }
}

export async function getDayEvents(range: DayRange): Promise<CalendarEvent[]> {
  try {
    console.info(`${CALENDAR_UI_LOG_PREFIX} requesting day events`, {
      dayStartIso: range.dayStartIso,
      dayEndIso: range.dayEndIso,
      connected: db.connected,
      connecting: db.connecting,
    });

    const rows = await getDayEventRows(range);

    console.info(`${CALENDAR_UI_LOG_PREFIX} day events loaded`, {
      count: rows.length,
      table: STREAM_EVENTS_TABLE,
    });

    return rows.map(mapCalendarEventRow);
  } catch (error) {
    console.error(`${CALENDAR_UI_LOG_PREFIX} failed to request day events`, error);
    return [];
  }
}
