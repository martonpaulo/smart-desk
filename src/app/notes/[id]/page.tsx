'use client';

import { CircularProgress, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageSection } from 'src/core/components/PageSection';
import { useNotesStore } from 'src/features/note/store/useNotesStore';
import type { Note } from 'src/features/note/types/Note';
import { NoteFullView } from 'src/features/note/views/NoteFullView';

/**
 * Individual note page that displays a note in full view mode.
 * This provides a dedicated route for each note with the same content as the edit modal.
 */
export default function NotePage() {
  const params = useParams();
  const noteId = params.id as string;

  const notes = useNotesStore(s => s.items);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  // Find the note by ID
  useEffect(() => {
    const foundNote = notes.find(n => n.id === noteId && !n.trashed);
    setNote(foundNote || null);
    setLoading(false);
  }, [noteId, notes]);

  if (loading) {
    return (
      <PageSection title="Loading Note">
        <CircularProgress />
      </PageSection>
    );
  }

  if (!note) {
    return (
      <PageSection title="Note Not Found">
        <Typography variant="body1" color="text.secondary">
          The requested note could not be found or may have been deleted.
        </Typography>
      </PageSection>
    );
  }

  return <NoteFullView note={note} />;
}
