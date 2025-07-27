import { createSupabaseEntityService } from '@/core/services/supabaseEntityService';
import { Note } from '@/features/note/types/Note';
import { RawNote } from '@/features/note/types/RawNote';

export const supabaseNotesService = createSupabaseEntityService<Note>({
  table: 'notes',
  mapToDB,
  mapFromDB,
});

function mapToDB(note: Note, userId: string): RawNote {
  return {
    id: note.id,
    user_id: userId,
    title: note.title || '',
    content: note.content || '',
    updated_at: note.updatedAt.toISOString(),
    created_at: note.createdAt.toISOString(),
  };
}

function mapFromDB(db: unknown): Note {
  const rawNote = db as RawNote;

  return {
    id: rawNote.id,
    title: rawNote.title,
    content: rawNote.content,
    updatedAt: new Date(rawNote.updated_at),
    createdAt: new Date(rawNote.created_at),
    isSynced: true,
  };
}
