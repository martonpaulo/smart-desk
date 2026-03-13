import type { DayItem, DayItemSource } from '@/features/calendar/types/day-item';
import { parseStoredTaskTags } from '@/features/tasks/logic/task-tags';

export interface DayItemRow {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: number | boolean;
  calendarId: string | null;
  calendarColor: string | null;
  source: DayItemSource | null;
  description: string | null;
  tags: string | null;
  plannedDate: string | null;
}

export function mapDayItemRow(row: DayItemRow): DayItem {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    allDay: Boolean(row.allDay),
    calendarId: row.calendarId,
    calendarColor: row.calendarColor,
    source: row.source,
    description: row.description,
    tags: parseStoredTaskTags(row.tags),
    plannedDate: row.plannedDate,
  };
}
