import { useEffect, useState } from 'react';

import { Circle as StatusIcon } from '@mui/icons-material';
import { alpha, ListItemIcon, ListItemText, MenuItem, Stack, TextField } from '@mui/material';

import { Tag } from '@/features/tag/types/Tag';
import { customColors } from '@/legacy/styles/colors';
import { CustomDialog } from '@/shared/components/CustomDialog';

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
