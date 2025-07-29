import { createSyncedEntityStore } from '@/core/store/createSyncedEntityStore';
import type { Note } from '@/features/note/types/Note';

export const useNotesStore = createSyncedEntityStore<Note>({
  table: 'notes',
  defaults: { title: '', content: '' },
});
