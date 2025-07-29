import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import { Note } from '@/features/note/types/Note';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';

interface NoteModalProps {
  open: boolean;
  initial?: Note;
  onSave: (note: Partial<Note> & { id?: string }) => void;
  onClose: () => void;
}

export function NoteModal({ open, initial, onSave, onClose }: NoteModalProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');

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
      <DialogTitle>{initial ? 'Edit Note' : 'New Note'}</DialogTitle>
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
