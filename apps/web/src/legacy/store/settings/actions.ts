import { getSupabaseClient } from 'src/legacy/lib/supabaseClient';
// Temporarily commented out due to module resolution issues in Vercel
// import {
//   deleteIcsCalendar,
//   fetchIcsCalendars,
//   upsertIcsCalendar,
// } from '../../../legacy/services/supabase/icsCalendarsService';
import {
  AddIcsCalendarData,
  DeleteIcsCalendarData,
  SettingsState,
  UpdateIcsCalendarData,
} from 'src/legacy/store/settings/types';
import { IcsCalendar } from 'src/legacy/types/icsCalendar';
import { mergeById } from 'src/legacy/utils/boardHelpers';
import type { StoreApi } from 'zustand';

type Set = StoreApi<SettingsState>['setState'];
type Get = StoreApi<SettingsState>['getState'];

// Add a new ICS calendar and mark it for sync
export async function addIcsCalendarAction(
  set: Set,
  get: Get,
  data: AddIcsCalendarData,
): Promise<string> {
  const id = crypto.randomUUID();

  const newCal: IcsCalendar = {
    id,
    title: data.title.trim(),
    color: data.color,
    source: data.source.trim(),
    updatedAt: data.updatedAt,
    isSynced: false,
    trashed: false,
    createdAt: data.updatedAt,
  };

  set(state => ({
    icsCalendars: [...state.icsCalendars, newCal],
    pendingIcsCalendars: [...state.pendingIcsCalendars, newCal],
  }));

  // trigger background sync
  void get().syncPending();
  return id;
}

// Synchronize all pending ICS calendars
export async function syncPendingAction(set: Set, get: Get) {
  const _client = getSupabaseClient();
  const pending = get().pendingIcsCalendars;
  const still: IcsCalendar[] = [];

  for (const cal of pending) {
    try {
      // const saved = await upsertIcsCalendar(client, cal);
      // update local calendar as synced
      // set(state => ({
      //   icsCalendars: state.icsCalendars.map(c =>
      //     c.id === saved.id ? { ...saved, isSynced: true } : c,
      //   ),
      // }));
    } catch (err) {
      console.error('ICS calendar sync failed', cal.id, err);
      still.push(cal);
    }
  }

  set({ pendingIcsCalendars: still });
}

// Fetch from server and merge with local state by updatedAt
export async function syncFromServerAction(set: Set, get: Get) {
  const _client = getSupabaseClient();
  try {
    // const remote = await fetchIcsCalendars(client);
    const remote: IcsCalendar[] = [];
    const local = get().icsCalendars;

    // merge lists by id, keeping the most recent updatedAt
    const mergedBase = mergeById(local, remote);

    const merged: IcsCalendar[] = mergedBase.map(c => {
      const localItem = local.find(l => l.id === c.id);
      const isSynced = !localItem || c.updatedAt >= localItem.updatedAt;
      return { ...c, isSynced };
    });

    set({
      icsCalendars: merged,
      pendingIcsCalendars: merged.filter(c => !c.isSynced),
    });
  } catch (err) {
    console.error('syncFromServer failed', err);
  }
}

// Update an existing ICS calendar and mark it for sync
export async function updateIcsCalendarAction(set: Set, get: Get, data: UpdateIcsCalendarData) {
  if (!get().icsCalendars.some(c => c.id === data.id)) {
    console.warn(`updateIcsCalendar: ${data.id} not found`);
    return;
  }

  set(state => {
    let updated: IcsCalendar | undefined;

    const icsCalendars = state.icsCalendars.map(c => {
      if (c.id !== data.id) return c;
      updated = {
        ...c,
        title: typeof data.title === 'string' ? data.title.trim() : c.title,
        color: data.color ?? c.color,
        source: typeof data.source === 'string' ? data.source.trim() : c.source,
        updatedAt: data.updatedAt,
        isSynced: false,
      };
      return updated;
    });

    const pendingIcsCalendars = updated
      ? [...state.pendingIcsCalendars.filter(c => c.id !== data.id), updated]
      : state.pendingIcsCalendars;

    return { icsCalendars, pendingIcsCalendars };
  });

  // trigger background sync
  await get().syncPending();
}

// Delete an ICS calendar locally and remotely, with retry on failure
export async function deleteIcsCalendarAction(set: Set, get: Get, data: DeleteIcsCalendarData) {
  const all = get().icsCalendars;
  const toDelete = all.find(c => c.id === data.id);
  if (!toDelete) {
    console.warn(`deleteIcsCalendar: ${data.id} not found`);
    return;
  }

  // remove locally
  set(state => ({
    icsCalendars: state.icsCalendars.filter(c => c.id !== data.id),
    pendingIcsCalendars: state.pendingIcsCalendars.filter(c => c.id !== data.id),
  }));

  try {
    // await deleteIcsCalendar(getSupabaseClient(), data.id);
  } catch (err) {
    console.error('remote deleteIcsCalendar failed', data.id, err);
    // re-add to pending for retry
    set(state => ({
      pendingIcsCalendars: [...state.pendingIcsCalendars, toDelete],
    }));
    await get().syncPending();
  }
}
