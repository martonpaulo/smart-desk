import { useEffect } from 'react';

import { useDefaultColumns } from '@/legacy/hooks/useDefaultColumns';
import { useBoardStore } from '@/legacy/store/board/store';
import { useEventStore } from '@/legacy/store/eventStore';
import type { Event } from '@/legacy/types/Event';
import { buildStorageKey } from '@/legacy/utils/localStorageUtils';
import { RESET_TIME } from '@/legacy/utils/resetTime';
import { isSameDay } from '@/legacy/utils/timeUtils';

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
  const [H, M] = RESET_TIME.split(':').map(Number);
  const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), H, M, 0);
  const lastReset =
    now < todayReset
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, H, M, 0)
      : todayReset;

  return now >= lastReset;
}

function filterTodaysAllDayEvents(events: Event[], today: Date): Event[] {
  return events.filter(evt => {
    if (!evt.allDay) return false;
    const start = new Date(evt.start);
    return start.toDateString() === today.toDateString();
  });
}

export function useProcessEventsColumn(now: Date = new Date()): void {
  const lastRun = loadLastRun();
  const colPromise = useDefaultColumns('events');
  const events = useEventStore.getState().events;
  const addTask = useBoardStore.getState().addTask;

  useEffect(() => {
    async function processEvents() {
      const col = await colPromise;
      if (lastRun && isSameDay(lastRun, now)) return;
      if (!afterResetTime(now)) return;
      if (!Array.isArray(events) || events.length === 0) return;
      if (!col) return;

      const todaysEvents = filterTodaysAllDayEvents(events, now);

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

    processEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, colPromise, events, addTask]);
}
