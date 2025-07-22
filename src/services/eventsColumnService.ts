import { defaultColumns } from '@/config/defaultColumns';
import { useBoardStore } from '@/store/board/store';
import { useEventStore } from '@/store/eventStore';
import type { Column } from '@/types/column';
import type { Event } from '@/types/Event';
import { buildStorageKey } from '@/utils/localStorageUtils';
import { RESET_TIME } from '@/utils/resetTime';
import { isSameDay } from '@/utils/timeUtils';

const STORAGE_KEY = buildStorageKey('events-column-last-run');

function loadLastRun(): Date | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? new Date(data) : null;
}

function saveLastRun(date: Date): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, date.toISOString());
}

function afterResetTime(now: Date): boolean {
  const [h, m] = RESET_TIME.split(':').map(Number);
  const reset = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    h,
    m,
    0,
    0,
  );
  return now.getTime() >= reset.getTime();
}

function filterTodaysAllDayEvents(events: Event[], today: Date): Event[] {
  return events.filter(evt => {
    if (!evt.allDay) return false;
    const start = new Date(evt.start);
    return start.toDateString() === today.toDateString();
  });
}

export async function processEventsColumn(now: Date = new Date()): Promise<void> {
  const lastRun = loadLastRun();
  if (lastRun && isSameDay(lastRun, now)) return;
  if (!afterResetTime(now)) return;

  const events = useEventStore.getState().events;
  if (!Array.isArray(events) || events.length === 0) return;

  const col = await ensureEventsColumn();
  if (!col) return;

  const todaysEvents = filterTodaysAllDayEvents(events, now);
  const addTask = useBoardStore.getState().addTask;

  for (const event of todaysEvents) {
    await addTask({
      title: event.title,
      notes: event.description ?? '',
      plannedDate: now,
      columnId: col.id,
      updatedAt: now,
    });
  }

  saveLastRun(now);
}

async function ensureEventsColumn(): Promise<Column | null> {
  const columns = useBoardStore.getState().columns;
  const existing = columns.find(c => c.title === defaultColumns.events.title);
  const addColumn = useBoardStore.getState().addColumn;
  const updateColumn = useBoardStore.getState().updateColumn;

  if (existing) {
    if (existing.trashed) {
      await updateColumn({ id: existing.id, trashed: false, updatedAt: new Date() });
    }
    return existing;
  }

  await addColumn({
    title: defaultColumns.events.title,
    color: defaultColumns.events.color,
    updatedAt: new Date(),
  });

  return useBoardStore.getState().columns.find(c => c.title === defaultColumns.events.title) ?? null;
}
