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

import { customColors } from '@/config/customColors';
import { Column } from '@/types/column';

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
  const [modalTitle, setModalTitle] = useState('');
  const [touched, setTouched] = useState(false);

  // Ref for title input
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    setTouched(false);

    if (column) {
      setTitle(column.title);
      setColor(column.color);
      setModalTitle('Edit Column');
    } else {
      setTitle('');
      setColor(customColors.blue.value);
      setModalTitle('Add Column');
    }

    // Delay focus to next tick to ensure element is mounted
    setTimeout(() => {
      if (titleInputRef.current) {
        const input = titleInputRef.current;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length); // move cursor to end
      }
    }, 0);
  }, [open, column]);

  const hasError = title.length > 16;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleCloseOnly = () => {
    onClose();
  };

  const handleSaveAndClose = () => {
    if (title.trim() === '' || hasError) {
      onClose();
      return;
    }
    const posToUse = prevPosition ?? column?.position;
    if (touched) onSave(title.trim(), color, posToUse);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAndClose();
    }
  };

  const handleDelete = () => {
    if (column && onDelete) {
      onDelete(column.id);
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
        {column && onDelete && (
          <Tooltip title="Delete column">
            <IconButton
              aria-label="delete column"
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
            inputRef={titleInputRef}
            label="Title"
            value={title}
            onChange={handleTitleChange}
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
