import { useEffect, useState } from 'react';

import { Circle as StatusIcon } from '@mui/icons-material';
import { alpha, ListItemIcon, ListItemText, MenuItem, Stack, TextField } from '@mui/material';

import { customColors } from '@/legacy/styles/colors';
import { Column } from '@/legacy/types/column';
import { CustomDialog } from '@/shared/components/CustomDialog';

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
      <TextField
        select
        label="Color"
        value={color}
        onChange={e => {
          setColor(e.target.value);
          setTouched(true);
        }}
        fullWidth
        slotProps={{
          select: {
            renderValue: (value: unknown) => {
              const selected = customColors[value as keyof typeof customColors];
              if (!selected) return null;
              return (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StatusIcon sx={{ color: alpha(selected.value, 0.75) }} />
                  <span>{selected.label}</span>
                </Stack>
              );
            },
          },
        }}
      >
        {Object.entries(customColors).map(([key, opt]) => (
          <MenuItem key={key} value={opt.value}>
            <ListItemIcon>
              <StatusIcon sx={{ color: alpha(opt.value, 0.75) }} />
            </ListItemIcon>
            <ListItemText primary={opt.label} />
          </MenuItem>
        ))}
      </TextField>
    </CustomDialog>
  );
}
