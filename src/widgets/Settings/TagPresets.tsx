import { useState, useEffect } from 'react';
import { Box, Button, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Stack, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { loadTagPresets, saveTagPresets, TagPreset } from '@/utils/tagPresetsStorage';

export function TagPresets() {
  const [presets, setPresets] = useState<TagPreset[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#1976d2');

  useEffect(() => {
    setPresets(loadTagPresets());
  }, []);

  const handleAdd = () => {
    if (!name.trim()) return;
    const next = [...presets, { name: name.trim(), color }];
    setPresets(next);
    saveTagPresets(next);
    setName('');
  };

  const handleDelete = (i: number) => {
    const next = presets.filter((_, idx) => idx !== i);
    setPresets(next);
    saveTagPresets(next);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField label="Tag" value={name} onChange={e => setName(e.target.value)} />
        <TextField label="Color" value={color} onChange={e => setColor(e.target.value)} />
        <Button onClick={handleAdd} variant="contained">Add</Button>
      </Stack>
      <List dense>
        {presets.map((p, idx) => (
          <ListItem key={idx} sx={{ pl: 0 }}>
            <ListItemText primary={p.name} secondary={p.color} />
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
