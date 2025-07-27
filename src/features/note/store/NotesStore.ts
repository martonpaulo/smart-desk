import type { SupabaseClient } from '@supabase/supabase-js';

import { createEntityStore, EntityState } from '@/core/store/genericEntityStore';
import { supabaseNotesService } from '@/features/note/services/supabaseNoteService';
import { Note } from '@/features/note/types/Note';

export type NotesState = EntityState<Note>;

export const useNotesStore = createEntityStore<Note>({
  key: 'notes',
  fetchAll: (client: SupabaseClient) => supabaseNotesService.fetchAll(client),
  upsert: (client: SupabaseClient, notes: Note) => supabaseNotesService.upsert(client, notes),
  softDelete: (client: SupabaseClient, id: string) => supabaseNotesService.softDelete(client, id),
  hardDelete: (client: SupabaseClient, id: string) => supabaseNotesService.hardDelete(client, id),
  buildAddEntity,
  buildUpdateEntity,
});

function buildAddEntity(data: Partial<Note>, id: string) {
  if (!data.createdAt) throw new Error('Missing required fields');

  return {
    id,
    title: '',
    content: '',
    createdAt: data.createdAt,
    updatedAt: data.createdAt,
    isSynced: false,
  };
}

function buildUpdateEntity(old: Note, data: Partial<Note>) {
  if (!data.id || !data.updatedAt) throw new Error('Missing ID or updatedAt for update');

  return {
    ...old,
    title: data.title?.trim() ?? old.title,
    content: data.content?.trim() ?? old.content,
    updatedAt: data.updatedAt,
    isSynced: false,
  };
}
