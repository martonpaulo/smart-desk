import { useEffect, useState } from 'react';

import { Circle as StatusIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

import { colorMap } from '@/styles/colors';
import { loadTagPresets, saveTagPresets, TagPreset } from '@/utils/tagPresetsStorage';

export function TagPresets() {
  const [presets, setPresets] = useState<TagPreset[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorMap.blue.value);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setPresets(loadTagPresets());
  }, []);

  const handleAdd = () => {
    if (!name.trim()) return;

    const updated = [...presets];
    const entry = { name: name.trim(), color };

    if (editingIndex != null) {
      updated[editingIndex] = entry;
    } else {
      updated.push(entry);
    }

    setPresets(updated);
    saveTagPresets(updated);
    setName('');
    setColor(colorMap.blue.value);
    setEditingIndex(null);
  };

  const handleDelete = (i: number) => {
    const next = presets.filter((_, idx) => idx !== i);
    setPresets(next);
    saveTagPresets(next);
  };

  const handleEdit = (i: number) => {
    const preset = presets[i];
    setName(preset.name);
    setColor(preset.color);
    setEditingIndex(i);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={2} mt={1}>
        <TextField label="Tag" value={name} onChange={e => setName(e.target.value)} />
        <TextField
          select
          label="Color"
          value={color}
          onChange={e => setColor(e.target.value)}
          sx={{ minWidth: 120 }}
          SelectProps={{
            renderValue: (value: unknown) => {
              const selected = Object.values(colorMap).find(
                (c: { value: string; label: string }) => c.value === value,
              );
              if (!selected) return null;
              return (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StatusIcon sx={{ color: selected.value }} />
                  <span>{selected.label}</span>
                </Stack>
              );
            },
          }}
        >
          {Object.values(colorMap).map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StatusIcon sx={{ color: opt.value }} />
                <span>{opt.label}</span>
              </Stack>
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={handleAdd} variant="contained">
          {editingIndex != null ? 'Update' : 'Add'}
        </Button>
      </Stack>
      <List dense>
        {presets.map((p, idx) => (
          <ListItem key={idx} sx={{ pl: 0 }} component="li" onClick={() => handleEdit(idx)}>
            <ListItemIcon>
              <StatusIcon sx={{ color: p.color }} />
            </ListItemIcon>
            <ListItemText primary={p.name} />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleDelete(idx)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
