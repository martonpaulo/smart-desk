import type { StoreApi } from 'zustand';

import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  deleteIcsCalendar,
  fetchIcsCalendars,
  upsertIcsCalendar,
} from '@/services/supabase/icsCalendarsService';
import {
  AddIcsCalendarData,
  DeleteIcsCalendarData,
  SettingsState,
  SyncIcsCalendar,
  UpdateIcsCalendarData,
} from '@/store/settings/types';
import { mergeById } from '@/utils/boardHelpers';

type Set = StoreApi<SettingsState>['setState'];
type Get = StoreApi<SettingsState>['getState'];

export async function addIcsCalendarAction(
  set: Set,
  get: Get,
  data: AddIcsCalendarData,
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();

  const newCal: SyncIcsCalendar = {
    id,
    title: data.title.trim(),
    color: data.color,
    source: data.source.trim(),
    updatedAt: now,
    isSynced: false,
  };

  set(state => ({
    icsCalendars: [...state.icsCalendars, newCal],
    pendingIcsCalendars: [...state.pendingIcsCalendars, newCal],
  }));

  // fire-and-forget
  void get().syncPending();
  return id;
}

export async function syncPendingAction(set: Set, get: Get) {
  const client = getSupabaseClient();
  const { pendingIcsCalendars } = get();

  const stillIcsCalendars: SyncIcsCalendar[] = [];
  for (const cal of pendingIcsCalendars) {
    try {
      const saved = await upsertIcsCalendar(client, cal);
      // mark calendar as synced
      set(state => ({
        icsCalendars: state.icsCalendars.map(c =>
          c.id === saved.id ? { ...saved, isSynced: true } : c,
        ),
      }));
    } catch (err) {
      console.error('ICS calendars sync failed', cal.id, err);
      stillIcsCalendars.push(cal);
    }
  }
  set({
    pendingIcsCalendars: stillIcsCalendars,
  });
}

export async function syncFromServerAction(set: Set, get: Get) {
  const client = getSupabaseClient();
  try {
    const remoteCals = await Promise.resolve(fetchIcsCalendars(client));

    const localCals = get().icsCalendars;

    // merge by updatedAt
    const mergedIcsCalendarsBase = mergeById(localCals, remoteCals);

    // rebuild with sync flags
    const mergedIcsCalendars: SyncIcsCalendar[] = mergedIcsCalendarsBase.map(c => {
      const local = localCals.find(l => l.id === c.id);
      const isSynced = !local || c.updatedAt >= local.updatedAt;
      return { ...c, isSynced };
    });

    set({
      icsCalendars: mergedIcsCalendars,
      pendingIcsCalendars: mergedIcsCalendars.filter(t => !t.isSynced),
    });
  } catch (err) {
    console.error('syncFromServer failed', err);
  }
}

export async function updateIcsCalendarAction(set: Set, get: Get, data: UpdateIcsCalendarData) {
  const exists = get().icsCalendars.some(c => c.id === data.id);
  if (!exists) {
    console.warn(`updateIcsCalendarAction: ICS calendar ${data.id} not found`);
    return;
  }

  set(state => {
    const now = new Date();
    let updated: SyncIcsCalendar | undefined;

    const icsCalendars = state.icsCalendars.map(c => {
      if (c.id !== data.id) return c;
      updated = {
        ...c,
        title: data.title?.trim() ?? c.title,
        color: data.color ?? c.color,
        source: data.source?.trim() ?? c.source,
        updatedAt: now,
        isSynced: false,
      };
      return updated;
    });

    // replace any previous pending for this id
    const pendingIcsCalendars = updated
      ? [...state.pendingIcsCalendars.filter(c => c.id !== data.id), updated]
      : state.pendingIcsCalendars;

    return { icsCalendars, pendingIcsCalendars };
  });

  // push change up
  await get().syncPending();
}

export async function deleteIcsCalendarAction(set: Set, get: Get, data: DeleteIcsCalendarData) {
  const exists = get().icsCalendars.some(c => c.id === data.id);
  if (!exists) {
    console.warn(`deleteIcsCalendar: ${data.id} not found`);
    return;
  }

  // remove locally
  set(state => ({
    icsCalendars: state.icsCalendars.filter(c => c.id !== data.id),
    pendingIcsCalendars: state.pendingIcsCalendars.filter(c => c.id !== data.id),
  }));

  // try remote delete
  try {
    await deleteIcsCalendar(getSupabaseClient(), data.id);
  } catch (err) {
    console.error('remote deleteIcsCalendar failed', data.id, err);
    // if remote delete fails, re-add to pending
    set(state => ({
      pendingIcsCalendars: [
        ...state.pendingIcsCalendars,
        {
          id: data.id,
          title: '',
          color: '',
          source: '',
          updatedAt: new Date(),
          isSynced: false,
        },
      ],
    }));
    // re-sync pending
    await get().syncPending();
  }
}
