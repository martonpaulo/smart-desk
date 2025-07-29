import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

import { useNotesStore } from '@/features/note/store/NotesStore';
import { Note } from '@/features/note/types/Note';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';
import { ModalDeleteButton } from '@/shared/components/ModalDeleteButton';

interface NoteModalProps {
  open: boolean;
  initial?: Note;
  onSave: (note: Partial<Note> & { id?: string }) => void;
  onClose: () => void;
}

export function NoteModal({ open, initial, onSave, onClose }: NoteModalProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const softDeleteNote = useNotesStore(s => s.softDelete);

  // reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setTitle(initial?.title || '');
      setContent(initial?.content || '');
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      // avoid saving empty notes
      return;
    }
    onSave({
      id: initial?.id,
      title: title.trim(),
      content: content.trim(),
      updatedAt: new Date(),
      createdAt: initial?.createdAt || new Date(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="mobileLg">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {initial ? 'Edit Note' : 'New Note'}
          {initial?.id && softDeleteNote && (
            <ModalDeleteButton onDelete={() => softDeleteNote(initial.id)} onClose={onClose} />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <MarkdownEditableBox
          label="Note Content"
          placeholder="Begin typing your note here..."
          value={content}
          onChange={setContent}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
