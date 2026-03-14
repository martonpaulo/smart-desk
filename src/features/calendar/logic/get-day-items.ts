import { db } from '@/db/powersync';
import type { DayItem } from '@/features/calendar/types/day-item';
import { type DayItemRow, mapDayItemRow } from '@/features/calendar/types/day-item-row';

interface DayWindow {
  dayStartIso: string;
  dayEndIso: string;
}

const CALENDAR_ITEMS_UI_LOG_PREFIX = '[calendar-items-ui]';
const ITEMS_QUERY_TIMEOUT_MS = 5000;
const STREAM_EVENTS_TABLE = 'calendar_events';
const STREAM_TASKS_TABLE = 'tasks';
const STREAM_EVENTS_SOURCE = 'google';
const STREAM_TASKS_SOURCE = 'task';

function getTimeoutError(): Error {
  return new Error(`items query timeout after ${ITEMS_QUERY_TIMEOUT_MS}ms`);
}

function getDayItemsQuery(): string {
  return `
    SELECT
      id,
      title,
      starts_at AS "startsAt",
      ends_at AS "endsAt",
      all_day AS "allDay",
      calendar_id AS "calendarId",
      calendar_color AS "calendarColor",
      '${STREAM_EVENTS_SOURCE}' AS source,
      NULL AS description,
      NULL AS tags,
      NULL AS "plannedDate"
    FROM ${STREAM_EVENTS_TABLE}
    WHERE starts_at < ? AND ends_at > ? AND deleted_at IS NULL
    UNION ALL
    SELECT
      id,
      title,
      planned_date AS "startsAt",
      date(planned_date, '+1 day') AS "endsAt",
      1 AS "allDay",
      NULL AS "calendarId",
      NULL AS "calendarColor",
      '${STREAM_TASKS_SOURCE}' AS source,
      description,
      tags,
      planned_date AS "plannedDate"
    FROM ${STREAM_TASKS_TABLE}
    WHERE planned_date >= date(?) AND planned_date < date(?) AND deleted_at IS NULL
    ORDER BY "allDay" DESC, "startsAt" ASC
  `;
}

async function getDayItemRows(dayWindow: DayWindow): Promise<DayItemRow[]> {
  const query = db.getAll<DayItemRow>(getDayItemsQuery(), [
    dayWindow.dayEndIso,
    dayWindow.dayStartIso,
    dayWindow.dayStartIso,
    dayWindow.dayEndIso,
  ]);

  let timeoutId: number | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(getTimeoutError()), ITEMS_QUERY_TIMEOUT_MS);
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

export async function getDayItems(window: DayWindow): Promise<DayItem[]> {
  try {
    const rows = await getDayItemRows(window);
    return rows.map(mapDayItemRow);
  } catch (error) {
    console.error(`${CALENDAR_ITEMS_UI_LOG_PREFIX} failed to request day items`, error);
    return [];
  }
}
