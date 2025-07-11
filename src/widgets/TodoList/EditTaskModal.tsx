import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { Delete as DeleteIcon } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  alpha,
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { theme } from '@/styles/theme';
import { loadTagPresets, saveTagPresets, TagPreset } from '@/utils/tagPresetsStorage';
import { COLUMN_COLORS } from '@/widgets/TodoList/ColumnModal';
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
  const [quantity, setQuantity] = useState<number | ''>('');
  const [useQuantity, setUseQuantity] = useState(false);
  const [presets, setPresets] = useState<TagPreset[]>([]);

  // ref para o input de tags
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPresets(loadTagPresets());
  }, []);

  // reset form quando a task mudar
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description || '');
    setTags(task.tags);
    setQuantity(task.quantityTotal ?? task.quantity ?? '');
    setUseQuantity(task.quantity != null || task.quantityTotal != null);
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
      if (!presets.some(p => p.name === value)) {
        const next = [...presets, { name: value, color: COLUMN_COLORS[0].value }];
        setPresets(next);
        saveTagPresets(next);
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

        if (!presets.some(p => p.name === value)) {
          const next = [...presets, { name: value, color: COLUMN_COLORS[0].value }];
          setPresets(next);
          saveTagPresets(next);
        }

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

    const qty = useQuantity && quantity !== '' ? 0 : undefined;
    const qtyTotal = useQuantity && quantity !== '' ? Number(quantity) : undefined;

    onSave({
      ...task,
      title: trimmedTitle,
      description: description.trim() || undefined,
      tags,
      quantity: qty,
      quantityTotal: qtyTotal,
    });
  };

  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleCloseOnly = () => onClose();

  const tagColor = column ? alpha(column.color, 0.65) : undefined;
  const tagTextColor = tagColor ? theme.palette.getContrastText(tagColor) : undefined;

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = Number(value);

    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

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

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ flexShrink: 0 }}>
              Use quantity?
            </Typography>

            <Checkbox
              checked={useQuantity}
              onChange={(_, checked) => {
                setUseQuantity(checked);
                if (!checked) setQuantity('');
              }}
            />
            <TextField
              label="Max quantity"
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              disabled={!useQuantity}
              fullWidth
            />
          </Stack>

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
            <Autocomplete
              freeSolo
              options={presets.map(p => p.name)}
              inputValue={tagInput}
              onInputChange={(_, value) => setTagInput(value)}
              onChange={(_, value) => {
                if (!value) return;
                const val = String(value).trim();
                if (!val) return;
                if (!tags.includes(val)) {
                  setTags(prev => [...prev, val]);
                }
                if (!presets.some(p => p.name === val)) {
                  const next = [...presets, { name: val, color: COLUMN_COLORS[0].value }];
                  setPresets(next);
                  saveTagPresets(next);
                }
                setTagInput('');
                setEditingTag(null);
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={editingTag ? 'Edit tag' : 'Add tag'}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => {
                    const value = tagInput.trim();
                    if (value && !tags.includes(value)) {
                      setTags(prev => [...prev, value]);
                      if (!presets.some(p => p.name === value)) {
                        const next = [...presets, { name: value, color: COLUMN_COLORS[0].value }];
                        setPresets(next);
                        saveTagPresets(next);
                      }
                    }
                    setTagInput('');
                    setEditingTag(null);
                  }}
                  inputRef={tagInputRef}
                  sx={{ minWidth: '200px' }}
                />
              )}
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
