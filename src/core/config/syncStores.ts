import { SyncStoreConfig } from '@/core/types/SyncStoreConfig';
import { useLocationStore } from '@/features/location/store/LocationStore';
import { useNotesStore } from '@/features/note/store/NotesStore';
import { useBoardStore } from '@/legacy/store/board/store';
import { useSettingsStorage } from '@/legacy/store/settings/store';

export const syncStores: SyncStoreConfig[] = [
  {
    syncFromServer: useBoardStore.getState().syncFromServer,
    syncPending: useBoardStore.getState().syncPending,
    intervalMs: 30_000,
  },
  {
    syncFromServer: useSettingsStorage.getState().syncFromServer,
    syncPending: useSettingsStorage.getState().syncPending,
    intervalMs: 60_000,
  },
  {
    syncFromServer: useLocationStore.getState().syncFromServer,
    syncPending: useLocationStore.getState().syncPending,
    intervalMs: 120_000,
  },
  {
    syncFromServer: useNotesStore.getState().syncFromServer,
    syncPending: useNotesStore.getState().syncPending,
    intervalMs: 30_000,
  },
];
