import { defineSync } from '@/core/utils/syncHelpers';
import { useLocationsStore } from '@/features/location/store/LocationsStore';
import { useNotesStore } from '@/features/note/store/NotesStore';
import { useBoardStore } from '@/legacy/store/board/store';
import { useSettingsStorage } from '@/legacy/store/settings/store';

export const syncStores = [
  defineSync(useBoardStore, 20_000),
  defineSync(useSettingsStorage, 60_000),
  defineSync(useLocationsStore, 120_000),
  defineSync(useNotesStore, 30_000),
];
