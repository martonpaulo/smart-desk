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

import { Column } from '@/widgets/TodoList/types';

export const COLUMN_COLORS = [
  { name: 'Blue', value: '#1976d2' },
  { name: 'Orange', value: '#ed6c02' },
  { name: 'Green', value: '#2e7d32' },
  { name: 'Red', value: '#d32f2f' },
  { name: 'Purple', value: '#9c27b0' },
  { name: 'Gray', value: '#616161' },
  { name: 'Black', value: '#000000' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Cyan', value: '#00bcd4' },
  { name: 'Teal', value: '#00796b' },
  { name: 'Lime', value: '#cddc39' },
  { name: 'Amber', value: '#ffc107' },
  { name: 'Brown', value: '#795548' },
  { name: 'Indigo', value: '#3f51b5' },
];

interface ColumnModalProps {
  open: boolean;
  column: Column | null;
  onSave: (title: string, color: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function ColumnModal({ open, column, onSave, onDelete, onClose }: ColumnModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLUMN_COLORS[0].value);
  const [modalTitle, setModalTitle] = useState('');

  // Ref for title input
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (column) {
      setTitle(column.title);
      setColor(column.color);
      setModalTitle('Edit Column');
    } else {
      setTitle('');
      setColor(COLUMN_COLORS[0].value);
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
  };

  const handleCloseOnly = () => {
    onClose();
  };

  const handleSaveAndClose = () => {
    if (title.trim() === '' || hasError) {
      onClose();
      return;
    }
    onSave(title.trim(), color);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAndClose();
    }
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
              onClick={onDelete}
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
            onChange={e => setColor(e.target.value)}
            fullWidth
            slotProps={{
              select: {
                renderValue: (value: unknown) => {
                  const selected = COLUMN_COLORS.find(c => c.value === value);
                  if (!selected) return null;
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <StatusIcon sx={{ color: alpha(selected.value, 0.75) }} />
                      <span>{selected.name}</span>
                    </Stack>
                  );
                },
              },
            }}
          >
            {COLUMN_COLORS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                <ListItemIcon>
                  <StatusIcon sx={{ color: alpha(opt.value, 0.75) }} />
                </ListItemIcon>
                <ListItemText primary={opt.name} />
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
