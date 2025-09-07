import { useEffect, useState } from 'react';

import { Tag } from 'src/features/tag/types/Tag';
import { customColors } from 'src/legacy/styles/colors';
import { ColorPicker } from 'src/shared/components/ColorPicker';
import { CustomDialog } from 'src/shared/components/CustomDialog';

interface TagModalProps {
  open: boolean;
  tag: Tag | null;
  prevPosition?: number;
  onSave: (name: string, color: string, prevPosition?: number) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function TagModal({ open, tag, prevPosition, onSave, onDelete, onClose }: TagModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(customColors.blue.value);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTouched(false);

    if (tag) {
      setName(tag.name);
      setColor(tag.color);
    } else {
      setName('');
      setColor(customColors.blue.value);
    }
  }, [open, tag]);

  const handleNameChange = (value: string) => {
    setName(value);
    setTouched(true);
  };

  const handleSave = async () => {
    const posToUse = prevPosition ?? tag?.position;
    if (touched) onSave(name.trim(), color, posToUse);
  };

  const handleDelete = async (id: string) => {
    if (tag && onDelete) onDelete(id);
  };

  return (
    <CustomDialog
      item="tag"
      open={open}
      mode={tag ? 'edit' : 'new'}
      maxWidth="mobileSm"
      isDirty={touched}
      isValid={name.trim() !== ''}
      onClose={onClose}
      onSave={handleSave}
      deleteAction={handleDelete}
      deleteId={tag?.id}
      title={name}
      onTitleChange={handleNameChange}
      titleLimit={16}
    >
      <ColorPicker
        value={color}
        onChange={e => {
          setColor(e.target.value);
          setTouched(true);
        }}
      />
    </CustomDialog>
  );
}
