import { SyncInterval } from '@/core/constants/SyncInterval';
import { defineSync } from '@/core/utils/syncHelpers';
import { useLocalEventsStore } from '@/features/event/store/LocalEventsStore';
import { useLocationsStore } from '@/features/location/store/LocationsStore';
import { useNotesStore } from '@/features/note/store/NotesStore';
import { useBoardStore } from '@/legacy/store/board/store';
import { useSettingsStorage } from '@/legacy/store/settings/store';

export const syncStores = [
  defineSync(useBoardStore, SyncInterval.HIGH),
  defineSync(useSettingsStorage, SyncInterval.MEDIUM),
  defineSync(useLocationsStore, SyncInterval.LOW),
  defineSync(useNotesStore, SyncInterval.HIGH),
  defineSync(useLocalEventsStore, SyncInterval.HIGH),
];
