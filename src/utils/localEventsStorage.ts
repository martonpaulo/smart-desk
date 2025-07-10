import { getSupabaseClient } from '@/lib/supabaseClient';
import { createEvent, fetchEvents } from '@/services/supabaseEventsService';
import { IEvent } from '@/types/IEvent';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

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
    const remote = await fetchEvents(supabase, { includeTrashed: true });
    const existing = new Set(remote.map(e => e.id));
    let updated = false;
    for (const ev of events) {
      if (!existing.has(ev.id)) {
        console.debug('Sync local event to Supabase', ev);
        const created = await createEvent(supabase, {
          id: ev.id,
          start: ev.start,
          end: ev.end,
          title: ev.title,
          attendeeCount: ev.attendeeCount,
          calendar: ev.calendar?.id,
          aknowledged: ev.aknowledged,
        });
        if (created.id !== ev.id) {
          ev.id = created.id;
          updated = true;
        }
      }
    }
    if (updated) {
      setStoredFilters(STORAGE_KEY, events);
    }
  } catch (err) {
    console.error('Failed syncing events to Supabase', err);
  }
}
