'use client';

import AddIcon from '@mui/icons-material/Add';
import { Fab, Pagination, Stack, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { PageSection } from 'src/core/components/PageSection';
import { NoteModal } from 'src/features/note/components/NoteModal';
import { useNotesStore } from 'src/features/note/store/useNotesStore';
import type { Note } from 'src/features/note/types/Note';
import { NoteCard } from 'src/features/note/views/NoteCard';
import { NotesGrid } from 'src/features/note/views/NotesGrid';
import { NotesToolbar } from 'src/features/note/views/NotesToolbar';
import { useResponsiveness } from 'src/shared/hooks/useResponsiveness';

export function NotesView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isMobile = useResponsiveness();
  const NOTES_PER_PAGE = isMobile ? 6 : 9;

  const allNotes = useNotesStore(s => s.items);
  const addNote = useNotesStore(s => s.add);
  const updateNote = useNotesStore(s => s.update);

  // Filter out deleted, newest first
  const notes = useMemo(
    () =>
      allNotes
        .filter(n => !n.trashed)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allNotes],
  );

  const rawPage = Number(searchParams.get('page') || '1');
  const pageCount = Math.max(1, Math.ceil(notes.length / NOTES_PER_PAGE));
  const page = rawPage < 1 ? 1 : rawPage > pageCount ? pageCount : rawPage;

  // keep URL in sync if someone enters an out-of-bounds page
  useEffect(() => {
    if (rawPage !== page) router.replace(`?page=${page}`);
  }, [rawPage, page]);

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
        title: note.title ?? '',
        content: note.content ?? '',
        color: note.color ?? '',
        createdAt: note.createdAt ?? new Date(),
        updatedAt: new Date(),
      });
    }
  };

  const handleOpenInNewTab = (note: Note) => {
    window.open(`/notes/${note.id}`, '_blank');
  };

  return (
    <PageSection title="Notes" description="Write, organize, and remember">
      {/* Desktop toolbar */}
      <NotesToolbar onAdd={() => openModal()} />

      {/* Empty state */}
      {notes.length === 0 && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ py: 4, color: 'text.secondary', textAlign: 'center' }}
        >
          <Typography variant="body2">No notes yet</Typography>
          <Typography variant="caption">Tap Add to create your first note</Typography>
        </Stack>
      )}

      {/* Grid of notes */}
      <NotesGrid>
        {paged.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={() => openModal(note)}
            onOpenInNewTab={() => handleOpenInNewTab(note)}
          />
        ))}
      </NotesGrid>

      {/* Pagination */}
      {pageCount > 1 && (
        <Stack alignItems="center" mt={2}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => router.push(`?page=${p}`)}
            size={isMobile ? 'small' : 'medium'}
          />
        </Stack>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="Add note"
          onClick={() => openModal()}
          sx={{ position: 'fixed', bottom: 88, right: 16 }} // above bottom nav if present
        >
          <AddIcon />
        </Fab>
      )}

      {/* Unified Note modal */}
      <NoteModal
        open={modalOpen}
        initial={editing ?? undefined}
        onSave={handleSave}
        onClose={closeModal}
      />
    </PageSection>
  );
}
