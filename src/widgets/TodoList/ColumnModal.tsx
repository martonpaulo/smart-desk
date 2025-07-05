import { useEffect, useState } from 'react';

import { Circle as StatusIcon } from '@mui/icons-material';
import {
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

import { Column } from '@/widgets/TodoList/types';

// Simple color options for users. Add more if needed.
export const COLUMN_COLORS = [
  { name: 'Blue', value: '#1976d2' },
  { name: 'Green', value: '#2e7d32' },
  { name: 'Orange', value: '#ed6c02' },
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

  useEffect(() => {
    if (column) {
      setTitle(column.title);
      setColor(column.color);
    } else {
      setTitle('');
      setColor(COLUMN_COLORS[0].value);
    }
  }, [column]);

  const handleConfirm = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(trimmed, color);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="tablet" fullWidth>
      <DialogTitle>{column ? 'Edit Column' : 'Add Column'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <TextField select label="Color" value={color} onChange={e => setColor(e.target.value)}>
            {COLUMN_COLORS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                <StatusIcon sx={{ color: alpha(opt.value, 0.75) }} />
                {opt.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        {column && onDelete && (
          <Button color="error" onClick={onDelete} disabled={column.id === 'done'}>
            Delete
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
