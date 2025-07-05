import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const COLOR_KEYS = ['primary', 'secondary', 'success', 'info', 'warning', 'error'] as const;

type ColorKey = (typeof COLOR_KEYS)[number];

interface AddColumnModalProps {
  open: boolean;
  onAdd: (title: string, color: string) => void;
  onClose: () => void;
}

export function AddColumnModal({ open, onAdd, onClose }: AddColumnModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<ColorKey>('primary');
  const theme = useTheme();

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, theme.palette[color].main);
    setTitle('');
    setColor('primary');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Column</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <TextField
            select
            label="Color"
            value={color}
            onChange={e => setColor(e.target.value as ColorKey)}
          >
            {COLOR_KEYS.map(c => (
              <MenuItem key={c} value={c} style={{ color: theme.palette[c].main }}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
