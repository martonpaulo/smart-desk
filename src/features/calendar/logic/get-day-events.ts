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

interface SqliteTableRow {
  name: string;
}

const CALENDAR_UI_LOG_PREFIX = '[calendar-ui]';
const EVENTS_QUERY_TIMEOUT_MS = 5000;
const SQLITE_TABLE_TYPE = 'table';
const STREAM_EVENTS_TABLE = 'calendar_events';
const LEGACY_EVENTS_TABLE = 'events';
const STREAM_EVENTS_SOURCE = 'google';
type EventsTableName = typeof STREAM_EVENTS_TABLE | typeof LEGACY_EVENTS_TABLE;

let cachedEventsTableName: EventsTableName | null = null;

function getTimeoutError(): Error {
  return new Error(`events query timeout after ${EVENTS_QUERY_TIMEOUT_MS}ms`);
}

function getDayEventsQuery(tableName: EventsTableName): string {
  if (tableName === STREAM_EVENTS_TABLE) {
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

  return `
    SELECT id, title, "startsAt", "endsAt", "allDay", "calendarId", source
    FROM ${LEGACY_EVENTS_TABLE}
    WHERE "startsAt" < ? AND "endsAt" > ?
    ORDER BY "startsAt" ASC
  `;
}

async function resolveEventsTableName(): Promise<EventsTableName> {
  if (cachedEventsTableName) {
    return cachedEventsTableName;
  }

  const rows = await db.getAll<SqliteTableRow>(
    `
      SELECT name
      FROM sqlite_master
      WHERE type = ?
        AND name IN (?, ?)
      ORDER BY
        CASE
          WHEN name = ? THEN 0
          WHEN name = ? THEN 1
          ELSE 2
        END
      LIMIT 1
    `,
    [
      SQLITE_TABLE_TYPE,
      STREAM_EVENTS_TABLE,
      LEGACY_EVENTS_TABLE,
      STREAM_EVENTS_TABLE,
      LEGACY_EVENTS_TABLE,
    ],
  );

  const tableName = rows[0]?.name as EventsTableName | undefined;
  if (!tableName) {
    throw new Error('No supported events table found in local SQLite schema');
  }

  cachedEventsTableName = tableName;
  return tableName;
}

async function getDayEventRows(range: DayRange): Promise<{ rows: CalendarEventRow[]; tableName: EventsTableName }> {
  const tableName = await resolveEventsTableName();

  const query = db.getAll<CalendarEventRow>(
    getDayEventsQuery(tableName),
    [range.dayEndIso, range.dayStartIso],
  );

  let timeoutId: number | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(getTimeoutError()), EVENTS_QUERY_TIMEOUT_MS);
  });

  try {
    const rows = await Promise.race([query, timeout]);
    return { rows, tableName };
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

    const { rows, tableName } = await getDayEventRows(range);

    console.info(`${CALENDAR_UI_LOG_PREFIX} day events loaded`, {
      count: rows.length,
      table: tableName,
    });

    return rows.map(mapCalendarEventRow);
  } catch (error) {
    console.error(`${CALENDAR_UI_LOG_PREFIX} failed to request day events`, error);
    return [];
  }
}
