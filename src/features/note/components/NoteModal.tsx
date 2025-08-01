import { useCallback, useEffect, useState } from 'react';

import { useNotesStore } from '@/features/note/store/NotesStore';
import { Note } from '@/features/note/types/Note';
import { CustomDialog } from '@/shared/components/CustomDialog';
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
  const deleteNote = useNotesStore(s => s.softDelete);

  // reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setTitle(initial?.title || '');
      setContent(initial?.content || '');
    }
  }, [open, initial]);

  const handleSave = useCallback(async () => {
    onSave({
      id: initial?.id,
      title: title.trim(),
      content: content.trim(),
      updatedAt: new Date(),
      createdAt: initial?.createdAt || new Date(),
    });
  }, [title, content, initial, onSave]);

  const isDirty = title !== initial?.title || content !== initial?.content;
  const isValid = title.trim() !== '' && content.trim() !== '';

  return (
    <CustomDialog
      item="note"
      open={open}
      mode={initial ? 'edit' : 'new'}
      isDirty={isDirty}
      isValid={isValid}
      onClose={onClose}
      onSave={handleSave}
      deleteAction={deleteNote}
      deleteId={initial?.id}
      title={title}
      onTitleChange={value => setTitle(value)}
      titlePlaceholder="What do you want to write about?"
      titleLimit={32}
    >
      <MarkdownEditableBox
        label="Note Content"
        placeholder="Begin typing your note here..."
        value={content}
        onChange={setContent}
      />
    </CustomDialog>
  );
}
