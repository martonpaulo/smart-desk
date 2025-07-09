import { IEvent } from '@/types/IEvent';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { createEvent, fetchEvents } from '@/services/supabaseEventsService';

const STORAGE_KEY = 'local-events';

export function loadLocalEvents(): IEvent[] {
  try {
    return getStoredFilters<IEvent[]>(STORAGE_KEY) ?? [];
  } catch {
    return [];
  }
}

export function saveLocalEvents(events: IEvent[]): void {
  try {
    setStoredFilters(STORAGE_KEY, events);
    void syncWithSupabase(events);
  } catch {
    console.error('Could not save local events');
  }
}

async function syncWithSupabase(events: IEvent[]): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const remote = await fetchEvents(supabase);
    const existing = new Set(remote.map(e => e.id));
    for (const ev of events) {
      if (!existing.has(ev.id)) {
        console.debug('Sync local event to Supabase', ev);
        await createEvent(supabase, {
          start: ev.start,
          end: ev.end,
          title: ev.title,
          attendeeCount: ev.attendeeCount,
          calendar: ev.calendar,
          aknowledged: ev.aknowledged,
        });
      }
    }
  } catch (err) {
    console.error('Failed syncing events to Supabase', err);
  }
}
