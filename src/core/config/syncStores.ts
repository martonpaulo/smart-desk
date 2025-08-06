import { SyncInterval } from '@/core/constants/SyncInterval';
import { defineSync } from '@/core/utils/syncHelpers';
import { useLocalEventsStore } from '@/features/event/store/useLocalEventsStore';
import { useFilesStore } from '@/features/file/store/useFilesStore';
import { useLocationsStore } from '@/features/location/store/useLocationsStore';
import { useMapsStore } from '@/features/map/store/useMapsStore';
import { useNotesStore } from '@/features/note/store/useNotesStore';
import { useTagsStore } from '@/features/tag/store/useTagsStore';
import { useBoardStore } from '@/legacy/store/board/store';
import { useSettingsStorage } from '@/legacy/store/settings/store';

export const syncStores = [
  defineSync(useBoardStore, SyncInterval.HIGH),
  defineSync(useLocalEventsStore, SyncInterval.HIGH),
  defineSync(useNotesStore, SyncInterval.HIGH),
  defineSync(useMapsStore, SyncInterval.HIGH),
  defineSync(useFilesStore, SyncInterval.HIGH),

  defineSync(useSettingsStorage, SyncInterval.MEDIUM),

  defineSync(useLocationsStore, SyncInterval.LOW),
  defineSync(useTagsStore, SyncInterval.LOW),
];
