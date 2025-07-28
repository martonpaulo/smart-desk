'use client';

import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Button, Pagination, Stack, Typography } from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { NoteCard } from '@/features/note/components/NoteCard';
import { NoteModal } from '@/features/note/components/NoteModal';
import { useNotesStore } from '@/features/note/store/NotesStore';
import { Note } from '@/features/note/types/Note';

const NOTES_PER_PAGE = 12;

export function NotesView() {
  const notes = useNotesStore(s => s.items);
  const addNote = useNotesStore(s => s.add);
  const updateNote = useNotesStore(s => s.update);

  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Note | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const start = (page - 1) * NOTES_PER_PAGE;
  const paged = notes.slice(start, start + NOTES_PER_PAGE);
  const pageCount = Math.ceil(notes.length / NOTES_PER_PAGE);

  const openModal = (note?: Note) => {
    setEditing(note || null);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSave = (note: Partial<Note> & { id?: string }) => {
    if (note.id) {
      updateNote(note as Note);
    } else {
      addNote({
        title: note.title!,
        content: note.content!,
        createdAt: note.createdAt!,
      });
    }
  };

  return (
    <PageSection title="Notes" description="Capture your thoughts—one note at a time">
      <Stack direction="row" mb={2} justifyContent="flex-end">
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openModal()}>
          Add Note
        </Button>
      </Stack>

      {notes.length === 0 && <Typography>No notes yet. Click “Add Note” to start.</Typography>}

      <Stack direction="row" flexWrap="wrap" gap={2} mb={2}>
        {paged.map(note => (
          <NoteCard key={note.id} note={note} onEdit={n => openModal(n)} />
        ))}
      </Stack>

      {pageCount > 1 && (
        <Stack alignItems="center" mt={2}>
          <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} />
        </Stack>
      )}

      <NoteModal
        open={modalOpen}
        initial={editing || undefined}
        onSave={handleSave}
        onClose={closeModal}
      />
    </PageSection>
  );
}
