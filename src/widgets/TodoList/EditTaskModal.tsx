import { useEffect, useState } from 'react';

import { Delete as DeleteIcon } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  alpha,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';

import { theme } from '@/styles/theme';
import { Column, TodoTask } from '@/widgets/TodoList/types';

interface EditTaskModalProps {
  task: TodoTask | null;
  open: boolean;
  onSave: (task: TodoTask) => void;
  onClose: () => void;
  onDeleteTask: (id: string) => void;
  column: Column | null;
}

export function EditTaskModal({
  task,
  open,
  onSave,
  onClose,
  column,
  onDeleteTask,
}: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Update state when task changes
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description || '');
    setTags(task.tags);
    setTagInput('');
  }, [task]);

  const [hoveredDeleteTag, setHoveredDeleteTag] = useState<string | null>(null);

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
    if (!task) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave({ ...task, title: trimmedTitle, description: description.trim() || undefined, tags });
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
      <DialogTitle sx={{ position: 'relative' }}>
        Edit Task
        {onDeleteTask && (
          <Tooltip title="Delete task" enterTouchDelay={0}>
            <IconButton
              aria-label="delete task"
              onClick={() => {
                if (task) {
                  onDeleteTask(task.id);
                }
                onClose();
              }}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>

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
            <Box display="flex" flexWrap="wrap" gap={1} overflow={'hidden'}>
              {tags.map(tag => (
                <Tooltip
                  key={tag}
                  title={hoveredDeleteTag === tag ? 'Delete tag' : 'Edit tag'}
                  enterTouchDelay={0}
                >
                  <Chip
                    label={tag}
                    onDelete={() => handleTagDelete(tag)}
                    onMouseEnter={() => setHoveredDeleteTag(null)} // clear tooltip if not over delete icon
                    onMouseLeave={() => setHoveredDeleteTag(null)}
                    deleteIcon={
                      <CancelIcon
                        onMouseEnter={e => {
                          e.stopPropagation();
                          setHoveredDeleteTag(tag);
                        }}
                        onMouseLeave={() => setHoveredDeleteTag(null)}
                      />
                    }
                    sx={{
                      bgcolor: tagColor ? `${tagColor}` : undefined,
                      color: tagTextColor,
                      cursor: 'pointer',
                      '& .MuiChip-deleteIcon': {
                        color: tagTextColor ? `${tagTextColor} !important` : undefined,
                      },
                      '&:hover': {
                        bgcolor: tagColor ? alpha(tagColor, 0.8) : undefined,
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
