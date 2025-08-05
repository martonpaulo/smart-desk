'use client';

import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

import { PageSection } from '@/core/components/PageSection';
import { NoteCard } from '@/features/note/components/NoteCard';
import { NoteModal } from '@/features/note/components/NoteModal';
import { useNotesStore } from '@/features/note/store/useNotesStore';
import { Note } from '@/features/note/types/Note';

const NOTES_PER_PAGE = 9;

export function NotesView() {
  const allNotes = useNotesStore(s => s.items);
  const addNote = useNotesStore(s => s.add);
  const updateNote = useNotesStore(s => s.update);

  // Filter out deleted notes
  const notes = allNotes.filter(note => !note.trashed);

  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get('page') || '1');

  const pageCount = Math.max(1, Math.ceil(notes.length / NOTES_PER_PAGE));
  const page = rawPage < 1 ? 1 : rawPage > pageCount ? pageCount : rawPage;

  // keep URL in sync if someone enters an out‑of‑bounds page
  useEffect(() => {
    if (rawPage !== page) {
      router.replace(`?page=${page}`);
    }
  }, [rawPage, page, router]);

  const start = (page - 1) * NOTES_PER_PAGE;
  const paged = notes.slice(start, start + NOTES_PER_PAGE);

  const [editing, setEditing] = useState<Note | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    <PageSection title="Notes" description="Capture your thoughts: one note at a time">
      <Stack direction="row" mb={2}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openModal()}>
          Add New
        </Button>
      </Stack>

      {notes.length === 0 && <Typography>No notes yet. Click “Add New” to start.</Typography>}

      <Stack direction="row" flexWrap="wrap" gap={2} mb={2}>
        {paged.map(note => (
          <NoteCard key={note.id} note={note} onEdit={n => openModal(n)} />
        ))}
      </Stack>

      {pageCount > 1 && (
        <Stack alignItems="center" mt={2}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => router.push(`?page=${p}`)}
          />
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
