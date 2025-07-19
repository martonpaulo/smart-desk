import { useEffect, useRef, useState } from 'react';

import { Delete as DeleteIcon } from '@mui/icons-material';
// import CancelIcon from '@mui/icons-material/Cancel';
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { QuantitySelector } from '@/components/QuantitySelector';
import { Column } from '@/types/column';
import { Task } from '@/types/task';

interface EditTaskModalProps {
  task: Task | null;
  open: boolean;
  onSave: (task: Task) => void;
  onClose: () => void;
  onDeleteTask: (id: string) => void;
  column?: Column | null;
}

export function EditTaskModal({
  task,
  open,
  onSave,
  onClose,
  onDeleteTask,
  // column,
}: EditTaskModalProps) {
  // always defined states
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  // const [tags, setTags] = useState<string[]>([]);
  // const [tagInput, setTagInput] = useState<string>('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  // const [hoveredDeleteTag, setHoveredDeleteTag] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [useQuantity, setUseQuantity] = useState<boolean>(false);
  const [useDaily, setUseDaily] = useState<boolean>(task?.daily ?? false);
  const [important, setImportant] = useState<boolean>(false);
  const [urgent, setUrgent] = useState<boolean>(false);
  // const [presets, setPresets] = useState<TagPreset[]>([]);
  const [touched, setTouched] = useState<boolean>(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // load saved presets once
  // useEffect(() => {
  //   setPresets(loadTagPresets());
  // }, []);

  // when task changes populate form with safe defaults
  useEffect(() => {
    if (!task) return;

    setTouched(false);

    setTitle(task.title);
    setNotes(task.notes ?? '');
    //setTags(task.tags ?? []);
    setQuantity(task.quantityTarget ?? 1);
    setUseQuantity((task.quantityTarget ?? 0) > 2);
    setUseDaily(task.daily ?? false);
    setImportant(task.important ?? false);
    setUrgent(task.urgent ?? false);

    // setTagInput('');
    setEditingTag(null);

    // focus title after dialog opens
    setTimeout(() => {
      titleInputRef.current?.focus();
      const len = titleInputRef.current?.value.length ?? 0;
      titleInputRef.current?.setSelectionRange(len, len);
    }, 0);
  }, [task]);

  // keep cursor at end when renaming a tag
  useEffect(() => {
    if (editingTag && tagInputRef.current) {
      tagInputRef.current.focus();
      const len = tagInputRef.current.value.length;
      tagInputRef.current.setSelectionRange(len, len);
    }
  }, [editingTag]);

  // // helper to add or rename a tag
  // const commitTag = (value: string) => {
  //   if (!value) return;
  //   if (editingTag) {
  //     // renaming
  //     setTags(prev => (prev.includes(value) ? prev : [...prev, value]));
  //     setEditingTag(null);
  //   } else {
  //     // new tag
  //     setTags(prev => (prev.includes(value) ? prev : [...prev, value]));
  //   }
  //   // save preset if new
  //   if (!presets.find(p => p.name === value)) {
  //     const next = [...presets, { name: value, color: COLUMN_COLORS[0].value }];
  //     setPresets(next);
  //     saveTagPresets(next);
  //   }
  //   setTagInput('');
  // };

  // handle space or enter in the tag textfield
  // const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === ' ' || (e.key === 'Enter' && !(e.ctrlKey || e.metaKey))) {
  //     e.preventDefault();
  //     //commitTag(tagInput.trim());
  //   }
  //   // cmd+enter also adds
  //   if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
  //     e.preventDefault();
  //     // commitTag(tagInput.trim());
  //     // save immediate change
  //     if (task && touched) {
  //       onSave({
  //         ...task,
  //         title: title.trim(),
  //         notes: notes.trim() || undefined,
  //         // tags: tags,
  //       });
  //     }
  //   }
  // };

  // final save
  const handleSaveAndClose = () => {
    if (!task) return;
    const newTitle = title.trim();
    if (!newTitle) return;
    if (touched) {
      onSave({
        ...task,
        title: newTitle,
        notes: notes.trim() || undefined,
        // tags,
        quantityDone: task.quantityDone, // keep existing done count
        quantityTarget: quantity,
        daily: useDaily,
        important,
        urgent,
      });
    }
    onClose();
  };

  // quick close
  const handleCloseOnly = () => onClose();

  // const tagBg = column ? alpha(column.color, 0.65) : undefined;
  // const tagFg = tagBg ? theme.palette.getContrastText(tagBg) : undefined;

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
            titleInputRef.current?.focus();
          },
        },
      }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        Edit Task
        <Tooltip title="Delete task">
          <IconButton
            aria-label="delete task"
            onClick={() => {
              if (useDaily) {
                // you cannot delete daily tasks
                alert('You cannot delete daily tasks. Please uncheck the "Daily" option first.');
                return;
              }
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
          {/* Title */}
          <TextField
            label="Title"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              setTouched(true);
            }}
            inputRef={titleInputRef}
            fullWidth
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveAndClose();
              }
            }}
          />

          {/* Quantifiable + Quantity selector */}
          <Stack>
            <Stack direction="row" alignItems="center">
              <Checkbox
                checked={useQuantity}
                onChange={(_, checked) => {
                  setUseQuantity(checked);
                  if (!checked) setQuantity(1);
                  setTouched(true);
                }}
              />
              <Typography variant="body2">Quantifiable</Typography>
              <QuantitySelector
                value={quantity}
                onValueChange={value => {
                  setQuantity(value);
                  setTouched(true);
                }}
                disabled={!useQuantity}
                minValue={1}
                maxValue={999}
                sx={{ ml: 2 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Checkbox
                checked={useDaily}
                onChange={(_, checked) => {
                  setUseDaily(checked);
                  setTouched(true);
                }}
              />
              <Typography variant="body2">Daily</Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Checkbox
                checked={important}
                onChange={(_, checked) => {
                  setImportant(checked);
                  setTouched(true);
                }}
              />
              <Typography variant="body2">Important</Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Checkbox
                checked={urgent}
                onChange={(_, checked) => {
                  setUrgent(checked);
                  setTouched(true);
                }}
              />
              <Typography variant="body2">Urgent</Typography>
            </Stack>
          </Stack>

          {/* Description */}
          <TextField
            label="Description"
            multiline
            minRows={6}
            value={notes}
            onChange={e => {
              setNotes(e.target.value);
              setTouched(true);
            }}
            fullWidth
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSaveAndClose();
              }
            }}
          />

          {/* Tags input + chips */}
          {/* <Stack direction="row" spacing={2}>
            <Autocomplete
              freeSolo
              options={presets.map(p => p.name)}
              inputValue={tagInput}
              onInputChange={(_, v) => setTagInput(v)}
              onChange={(_, v) => {
                const val = String(v).trim();
                if (val) commitTag(val);
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={editingTag ? 'Edit tag' : 'Add tag'}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => commitTag(tagInput.trim())}
                  inputRef={tagInputRef}
                  sx={{ minWidth: 200 }}
                />
              )}
            />

            <Box display="flex" flexWrap="wrap" gap={1}>
              {tags.map(tag => (
                <Tooltip key={tag} title={hoveredDeleteTag === tag ? 'Delete tag' : 'Edit tag'}>
                  <Chip
                    label={tag}
                    onClick={() => {
                      setEditingTag(tag);
                      setTagInput(tag);
                      setTags(prev => prev.filter(t => t !== tag));
                    }}
                    onDelete={() => {
                      setTags(prev => prev.filter(t => t !== tag));
                      if (editingTag === tag) {
                        setEditingTag(null);
                        setTagInput('');
                      }
                    }}
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
                      bgcolor: tagBg,
                      color: tagFg,
                      '&:hover': { bgcolor: alpha(tagBg ?? '#000', 0.9) },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Stack> */}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
