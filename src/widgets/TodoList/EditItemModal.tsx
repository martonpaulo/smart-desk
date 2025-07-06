import { useEffect, useState } from 'react';

import {
  alpha,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

import { theme } from '@/styles/theme';
import { Column, TodoItem } from '@/widgets/TodoList/types';

interface EditItemModalProps {
  item: TodoItem | null;
  open: boolean;
  onSave: (item: TodoItem) => void;
  onClose: () => void;
  column: Column | null;
}

export function EditItemModal({ item, open, onSave, onClose, column }: EditItemModalProps) {
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

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if (e.key === 'Enter' && isCtrlOrCmd) {
      e.preventDefault();
      handleSaveAndClose();
    }
  };

  const handleTagDelete = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleCloseOnly = () => {
    onClose();
  };

  const handleSaveAndClose = () => {
    if (!item) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave({ ...item, title: trimmedTitle, description: description.trim() || undefined, tags });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAndClose();
    }
  };

  const tagColor = column ? alpha(column.color, 0.65) : undefined;
  const tagTextColor = tagColor ? theme.palette.getContrastText(tagColor) : undefined;

  const handleKeyDownArea = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if (e.key === 'Enter' && isCtrlOrCmd) {
      e.preventDefault();
      handleSaveAndClose();
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="mobileLg"
      fullWidth
      onClose={(_, reason) => {
        if (reason === 'escapeKeyDown') {
          handleCloseOnly();
        } else {
          handleSaveAndClose();
        }
      }}
    >
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
          />
          <TextField
            label="Description"
            multiline
            minRows={6}
            onKeyDown={handleKeyDownArea}
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Add tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              sx={{ minWidth: '200px' }}
            />
            <Box display="flex" flexWrap="wrap" gap={1}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  sx={{
                    bgcolor: tagColor ? `${tagColor}` : undefined,
                    color: tagTextColor,
                    '& .MuiChip-deleteIcon': {
                      color: tagTextColor ? `${tagTextColor} !important` : undefined,
                    },
                    '&:hover': {
                      bgcolor: tagColor ? alpha(tagColor, 0.8) : undefined,
                    },
                  }}
                />
              ))}
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
