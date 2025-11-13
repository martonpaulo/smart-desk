import { useEffect, useState } from 'react';

import { customColors } from 'src/legacy/styles/colors';
import { Column } from 'src/legacy/types/column';
import { ColorPicker } from 'src/shared/components/ColorPicker';
import { CustomDialog } from 'src/shared/components/CustomDialog';

interface ColumnModalProps {
  open: boolean;
  column: Column | null;
  prevPosition?: number;
  onSave: (title: string, color: string, prevPosition?: number) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function ColumnModal({
  open,
  column,
  prevPosition,
  onSave,
  onDelete,
  onClose,
}: ColumnModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(customColors.blue.value);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTouched(false);

    if (column) {
      setTitle(column.title);
      setColor(column.color);
    } else {
      setTitle('');
      setColor(customColors.blue.value);
    }
  }, [open, column]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setTouched(true);
  };

  const handleSave = async () => {
    const posToUse = prevPosition ?? column?.position;
    onSave(title.trim(), color, posToUse);
  };

  const handleDelete = async (id: string) => {
    if (onDelete) onDelete(id);
  };

  return (
    <CustomDialog
      item="column"
      open={open}
      mode={column ? 'edit' : 'new'}
      maxWidth="mobileSm"
      isDirty={touched}
      isValid={title.trim() !== ''}
      onClose={onClose}
      onSave={handleSave}
      deleteAction={handleDelete}
      deleteId={column?.id}
      title={title}
      onTitleChange={handleTitleChange}
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
