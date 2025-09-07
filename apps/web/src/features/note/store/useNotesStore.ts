import { createSyncedEntityStore } from 'src/core/store/createSyncedEntityStore';
import type { Note } from 'src/features/note/types/Note';
import { customColors } from 'src/legacy/styles/colors';

export const useNotesStore = createSyncedEntityStore<Note>({
  table: 'notes',
  defaults: { title: '', content: '', color: customColors.blue.value },
});
