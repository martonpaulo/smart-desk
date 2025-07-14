import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  addIcsCalendarAction,
  syncFromServerAction,
  syncPendingAction,
  updateIcsCalendarAction,
} from '@/store/settings/actions';
import { deleteIcsCalendarAction } from '@/store/settings/actions';
import { SettingsState } from '@/store/settings/types';
import { buildStorageKey } from '@/utils/localStorageUtils';

export const useSettingsStorage = create<SettingsState>()(
  persist(
    (set, get) => ({
      icsCalendars: [],
      pendingIcsCalendars: [],

      addIcsCalendar: data => addIcsCalendarAction(set, get, data),

      updateIcsCalendar: data => updateIcsCalendarAction(set, get, data),
      deleteIcsCalendar: data => deleteIcsCalendarAction(set, get, data),

      syncPending: () => syncPendingAction(set, get),
      syncFromServer: () => syncFromServerAction(set, get),
    }),
    {
      name: buildStorageKey('settings'),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
