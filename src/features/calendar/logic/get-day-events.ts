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

function getTimeoutError(): Error {
  return new Error(`events query timeout after ${EVENTS_QUERY_TIMEOUT_MS}ms`);
}

async function getDayEventRows(range: DayRange): Promise<CalendarEventRow[]> {
  const query = db.getAll<CalendarEventRow>(
    `
      SELECT id, title, "startsAt", "endsAt", "allDay", "calendarId", source
      FROM events
      WHERE "startsAt" < ? AND "endsAt" > ?
      ORDER BY "startsAt" ASC
    `,
    [range.dayEndIso, range.dayStartIso],
  );

  const timeout = new Promise<CalendarEventRow[]>((_, reject) => {
    window.setTimeout(() => reject(getTimeoutError()), EVENTS_QUERY_TIMEOUT_MS);
  });

  return Promise.race([query, timeout]);
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
      table: 'events',
    });

    return rows.map(mapCalendarEventRow);
  } catch (error) {
    console.error(`${CALENDAR_UI_LOG_PREFIX} failed to request day events`, error);
    return [];
  }
}
