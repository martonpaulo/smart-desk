import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Button, Stack, TextField } from '@mui/material';

interface AddItemFormProps {
  onAdd: (title: string, description: string, tags: string[]) => void;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const handleAdd = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onAdd(
      trimmedTitle,
      description.trim(),
      tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    );

    setTitle('');
    setDescription('');
    setTags('');
  };

  return (
    <Stack mt={2} spacing={1} component="form" onSubmit={e => e.preventDefault()}>
      <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <TextField
        label="Tags (comma separated)"
        value={tags}
        onChange={e => setTags(e.target.value)}
      />
      <Button variant="contained" onClick={handleAdd} startIcon={<AddIcon />}>
        Add Item
      </Button>
    </Stack>
  );
}
