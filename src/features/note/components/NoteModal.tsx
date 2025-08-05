import { useCallback, useEffect, useState } from 'react';

import { useNotesStore } from '@/features/note/store/NotesStore';
import { Note } from '@/features/note/types/Note';
import { ColorPicker } from '@/shared/components/ColorPicker';
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
  const [color, setColor] = useState<string>(initial?.color || '');
  const deleteNote = useNotesStore(s => s.softDelete);

  // reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setTitle(initial?.title || '');
      setContent(initial?.content || '');
      setColor(initial?.color || '');
    }
  }, [open, initial]);

  const handleSave = useCallback(async () => {
    onSave({
      id: initial?.id,
      title: title.trim(),
      content: content.trim(),
      color: color || '',
      updatedAt: new Date(),
      createdAt: initial?.createdAt || new Date(),
    });
  }, [onSave, initial?.id, initial?.createdAt, title, content, color]);

  const isDirty =
    title !== initial?.title || content !== initial?.content || color !== initial?.color;
  const isValid = title.trim() !== '';
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
      <ColorPicker value={color} onChange={setColor} />

      <MarkdownEditableBox
        label="Note Content"
        placeholder="Begin typing your note here..."
        value={content}
        onChange={setContent}
      />
    </CustomDialog>
  );
}
