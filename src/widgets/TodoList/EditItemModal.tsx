import { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from '@mui/material';

import { TodoItem } from '@/widgets/TodoList/types';

interface EditItemModalProps {
  item: TodoItem | null;
  open: boolean;
  onSave: (item: TodoItem) => void;
  onClose: () => void;
}

export function EditItemModal({ item, open, onSave, onClose }: EditItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Update state when item changes
  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setDescription(item.description || '');
    setTags(item.tags);
    setTagInput('');
  }, [item]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value)) {
        setTags(prev => [...prev, value]);
      }
      setTagInput('');
    }
  };

  const handleTagDelete = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!item) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave({ ...item, title: trimmedTitle, description: description.trim() || undefined, tags });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="tablet" fullWidth>
      <DialogTitle>Edit Item</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            multiline
            minRows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
          />
          <Box>
            <TextField
              label="Add tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {tags.map(tag => (
                <Chip key={tag} label={tag} onDelete={() => handleTagDelete(tag)} />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
