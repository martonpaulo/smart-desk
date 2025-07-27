'use client';
import { Add as AddIcon } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { useNotesStore } from '@/features/note/store/NotesStore';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';

export function NotesView() {
  const notes = useNotesStore(s => s.items);
  const addNote = useNotesStore(s => s.add);
  const updateNote = useNotesStore(s => s.update);

  // update content of an existing note
  const handleNoteChange = (id: string) => (content: string) => {
    updateNote({ id, content, updatedAt: new Date() });
  };

  // append a fresh note
  const handleAddNote = () => {
    addNote({ createdAt: new Date() });
  };

  return (
    <PageSection
      title="Notes"
      description="Write down your thoughts, ideas, or anything you want to remember."
    >
      <Stack direction="row" mb={2}>
        <Button onClick={handleAddNote} variant="outlined" startIcon={<AddIcon />}>
          Add Note
        </Button>
      </Stack>

      {notes.map(note => (
        <MarkdownEditableBox
          key={note.id}
          label={note.title || 'Untitled Note'}
          placeholder="Write your notes here..."
          value={note.content}
          onChange={handleNoteChange(note.id)}
        />
      ))}
    </PageSection>
  );
}
