import { useEffect, useRef, useState } from 'react';

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
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [hoveredDeleteTag, setHoveredDeleteTag] = useState<string | null>(null);

  // ref para o input de tags
  const tagInputRef = useRef<HTMLInputElement>(null);

  // reset form quando a task mudar
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description || '');
    setTags(task.tags);
    setTagInput('');
    setEditingTag(null);
  }, [task]);

  // quando entrar em modo de edição de tag, foca e posiciona cursor no fim
  useEffect(() => {
    if (editingTag && tagInputRef.current) {
      tagInputRef.current.focus();
      const len = tagInputRef.current.value.length;
      tagInputRef.current.setSelectionRange(len, len);
    }
  }, [editingTag]);

  // clicar no chip inicia edição
  const handleChipClick = (tag: string) => {
    setEditingTag(tag);
    setTagInput(tag);
    setTags(prev => prev.filter(t => t !== tag));
  };

  // deletar tag
  const handleTagDelete = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    if (editingTag === tag) {
      setEditingTag(null);
      setTagInput('');
    }
  };

  // adicionar ou renomear tag
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if ((e.key === ' ' || e.key === 'Enter') && !isCtrlOrCmd) {
      e.preventDefault();
      const value = tagInput.trim();
      if (!value) return;

      if (editingTag) {
        // renomear
        if (!tags.includes(value)) {
          setTags(prev => [...prev, value]);
        }
        setEditingTag(null);
      } else {
        // adicionar nova
        if (!tags.includes(value)) {
          setTags(prev => [...prev, value]);
        }
      }
      setTagInput('');
    }

    if (e.key === 'Enter' && isCtrlOrCmd) {
      e.preventDefault();

      const value = tagInput.trim();
      if (value && !tags.includes(value)) {
        const newTags = [...tags, value];
        setTags(newTags);
        setTagInput('');
        setEditingTag(null);

        // salva fora do setState
        if (task) {
          onSave({
            ...task,
            title: title.trim(),
            description: description.trim() || undefined,
            tags: newTags,
          });
        }
      }
    }
  };

  // salva e fecha
  const handleSaveAndClose = () => {
    if (!task) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave({
      ...task,
      title: trimmedTitle,
      description: description.trim() || undefined,
      tags,
    });
  };

  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleCloseOnly = () => onClose();

  const tagColor = column ? alpha(column.color, 0.65) : undefined;
  const tagTextColor = tagColor ? theme.palette.getContrastText(tagColor) : undefined;

  return (
    <Dialog
      open={open}
      maxWidth="mobileLg"
      fullWidth
      onClose={(_, reason) => {
        if (reason === 'escapeKeyDown') handleCloseOnly();
        else handleSaveAndClose();
      }}
      slotProps={{
        transition: {
          onEntered: () => {
            if (titleInputRef.current) {
              const input = titleInputRef.current;
              input.focus();
              const len = input.value.length;
              input.setSelectionRange(len, len);
            }
          },
        },
      }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        Edit Task
        <Tooltip title="Delete task" enterTouchDelay={0}>
          <IconButton
            aria-label="delete task"
            onClick={() => {
              if (task) onDeleteTask(task.id);
              onClose();
            }}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveAndClose();
              }
            }}
            inputRef={titleInputRef}
            fullWidth
          />

          <TextField
            label="Description"
            multiline
            minRows={6}
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => {
              const isCtrlOrCmd = e.ctrlKey || e.metaKey;
              if (e.key === 'Enter' && isCtrlOrCmd) {
                e.preventDefault();
                handleSaveAndClose();
              }
            }}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label={editingTag ? 'Edit tag' : 'Add tag'}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              inputRef={tagInputRef}
              sx={{ minWidth: '200px' }}
            />

            <Box display="flex" flexWrap="wrap" gap={1} overflow="hidden">
              {tags.map(tag => (
                <Tooltip
                  key={tag}
                  title={hoveredDeleteTag === tag ? 'Delete tag' : 'Edit tag'}
                  enterTouchDelay={0}
                >
                  <Chip
                    label={tag}
                    onClick={() => handleChipClick(tag)}
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
                      bgcolor: tagColor,
                      color: tagTextColor,
                      cursor: 'pointer',
                      '& .MuiChip-deleteIcon': {
                        color: `${tagTextColor} !important`,
                      },
                      '&:hover': {
                        bgcolor: tagColor ? alpha(tagColor, 0.95) : undefined,
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
