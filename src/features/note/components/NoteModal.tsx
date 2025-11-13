import { useCallback, useEffect, useState } from 'react';

import { useNotesStore } from 'src/features/note/store/useNotesStore';
import { Note } from 'src/features/note/types/Note';
import { ColorPicker } from 'src/shared/components/ColorPicker';
import { CustomDialog } from 'src/shared/components/CustomDialog';
import { MarkdownEditableBox } from 'src/shared/components/MarkdownEditableBox';

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
  const restoreNote = useNotesStore(s => s.restore);

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
      restoreAction={restoreNote}
      deleteId={initial?.id}
      title={title}
      onTitleChange={value => setTitle(value)}
      titlePlaceholder="What do you want to write about?"
      titleLimit={32}
    >
      <ColorPicker value={color} onChange={e => setColor(e.target.value)} />

      <MarkdownEditableBox
        label="Note Content"
        placeholder="Begin typing your note here..."
        value={content}
        onChange={setContent}
      />
    </CustomDialog>
  );
}
