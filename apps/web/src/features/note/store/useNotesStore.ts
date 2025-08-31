import { createSyncedEntityStore } from '@/core/store/createSyncedEntityStore';
import type { Note } from '@/features/note/types/Note';
import { customColors } from '@/legacy/styles/colors';

export const useNotesStore = createSyncedEntityStore<Note>({
  table: 'notes',
  defaults: { title: '', content: '', color: customColors.blue.value },
});
