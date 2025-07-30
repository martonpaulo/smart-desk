import { useEffect, useRef, useState } from 'react';

import { Circle as StatusIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  alpha,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';

import { Tag } from '@/features/tag/types/Tag';
import { customColors } from '@/legacy/styles/colors';

interface TagModalProps {
  open: boolean;
  tag: Tag | null;
  prevPosition?: number;
  onSave: (name: string, color: string, prevPosition?: number) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function TagModal({
  open,
  tag,
  prevPosition,
  onSave,
  onDelete,
  onClose,
}: TagModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(customColors.blue.value);
  const [modalTitle, setModalTitle] = useState('');
  const [touched, setTouched] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    setTouched(false);

    if (tag) {
      setName(tag.name);
      setColor(tag.color);
      setModalTitle('Edit Tag');
    } else {
      setName('');
      setColor(customColors.blue.value);
      setModalTitle('Add Tag');
    }

    setTimeout(() => {
      nameInputRef.current?.focus();
      const el = nameInputRef.current;
      el?.setSelectionRange(el.value.length, el.value.length);
    }, 0);
  }, [open, tag]);

  const hasError = name.length > 16;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setTouched(true);
  };

  const handleCloseOnly = () => {
    onClose();
  };

  const handleSaveAndClose = () => {
    if (name.trim() === '' || hasError) {
      onClose();
      return;
    }
    const posToUse = prevPosition ?? tag?.position;
    if (touched) onSave(name.trim(), color, posToUse);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAndClose();
    }
  };

  const handleDelete = () => {
    if (tag && onDelete) {
      onDelete(tag.id);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'escapeKeyDown') {
          handleCloseOnly();
        } else {
          handleSaveAndClose();
        }
      }}
      maxWidth="mobileSm"
      fullWidth
    >
      <DialogTitle sx={{ position: 'relative' }}>
        {modalTitle}
        {tag && onDelete && (
          <Tooltip title="Delete tag">
            <IconButton
              aria-label="delete tag"
              onClick={handleDelete}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            inputRef={nameInputRef}
            label="Name"
            value={name}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            error={hasError}
            helperText={hasError ? 'Max 16 characters' : ''}
            fullWidth
          />

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
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
