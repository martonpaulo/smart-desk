import { KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
  Backdrop,
  ClickAwayListener,
  Collapse,
  IconButton,
  SpeedDial,
  SpeedDialIcon,
  Stack,
  TextField,
  Tooltip,
  useTheme,
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { QuantitySelector } from '@/components/QuantitySelector';
import { Task } from '@/types/task';
import { formatDuration, parseDuration } from '@/utils/timeUtils';

type TaskContext = 'online' | 'out' | 'afk' | 'talk';

interface AddTaskFloatButtonProps {
  onAdd: (task: Partial<Task>) => Promise<string>;
}

export function AddTaskFloatButton({ onAdd }: AddTaskFloatButtonProps) {
  const theme = useTheme();
  const zIndex = theme.zIndex.modal;

  // form open state
  const [open, setOpen] = useState(false);
  // whether optional fields are shown
  const [isExpanded, setIsExpanded] = useState(false);

  // required fields
  const [title, setTitle] = useState('');
  const [important, setImportant] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [eod, setEod] = useState(false);
  const [duration, setDuration] = useState(20);
  const [taskContext, setTaskContext] = useState<TaskContext>('online');

  // optional fields
  const [quantityTarget, setQuantityTarget] = useState(1);
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [blocked, setBlocked] = useState(false);

  // reset all fields and collapse options
  const resetForm = () => {
    setTitle('');
    setImportant(false);
    setUrgent(false);
    setEod(false);
    setDuration(20);
    setTaskContext('online');
    setQuantityTarget(1);
    setCategory('');
    setNotes('');
    setBlocked(false);
    setIsExpanded(false);
  };

  const openForm = () => setOpen(true);
  const closeForm = useCallback(() => {
    setOpen(false);
    resetForm();
  }, []);

  // handle click or Enter on title field
  const submitTask = useCallback(() => {
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      notes: notes.trim() || undefined,
      important,
      urgent,
      quantityDone: 0,
      quantityTarget,
    });
    closeForm();
  }, [title, onAdd, important, urgent, quantityTarget, notes, closeForm]);

  // Ctrl/Cmd + Enter anywhere in open form triggers submit
  useEffect(() => {
    if (!open) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeForm();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitTask();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open, title, submitTask, closeForm]);

  // toggle flags as an array for ToggleButtonGroup
  const activeFlags = [
    important && 'important',
    urgent && 'urgent',
    eod && 'eod',
    blocked && 'blocked',
  ].filter(Boolean) as string[];

  const handleFlagsChange = (_event: unknown, newFlags: string[]) => {
    setImportant(newFlags.includes('important'));
    setUrgent(newFlags.includes('urgent'));
    setEod(newFlags.includes('eod'));
    setBlocked(newFlags.includes('blocked'));
  };

  return (
    <>
      <Backdrop open={open} />
      <Tooltip title="Add new task" placement="left">
        <SpeedDial
          ariaLabel="Add Task"
          sx={{ position: 'fixed', bottom: 80, right: 16 }}
          icon={<SpeedDialIcon openIcon={<EditIcon />} />}
          onClick={openForm}
        />
      </Tooltip>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <ClickAwayListener onClickAway={closeForm}>
          <Stack
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            zIndex={zIndex}
            px={2}
            pt={2}
            pb={4}
            spacing={2}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 3,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Title input */}
            <TextField
              autoFocus
              placeholder="What would you like to do?"
              variant="standard"
              fullWidth
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={(e: ReactKeyboardEvent) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitTask();
                }
              }}
              slotProps={{
                input: {
                  disableUnderline: true,
                  endAdornment: (
                    <Tooltip placement="left" title={title.trim() ? 'Add task' : ''}>
                      <InputAdornment position="end">
                        <IconButton
                          onClick={submitTask}
                          disabled={!title.trim()}
                          size="small"
                          edge="end"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            transition: 'background-color 0.15s',
                            '&:focus-visible': {
                              outline: '2px solid rgba(0, 0, 0, 0.5)',
                              outlineOffset: 2,
                            },
                          }}
                        >
                          <PlaylistAddIcon />
                        </IconButton>
                      </InputAdornment>
                    </Tooltip>
                  ),
                },
              }}
            />

            {/* Optional note field */}
            {isExpanded && (
              <TextField
                placeholder="Enter a description"
                multiline
                fullWidth
                size="small"
                value={notes}
                variant="standard"
                onChange={e => setNotes(e.target.value)}
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: {
                      fontSize: theme.typography.body2.fontSize,
                      lineHeight: theme.typography.body2.lineHeight,
                    },
                  },
                }}
              />
            )}

            {/* Flags, context, duration and expand/collapse */}
            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              gap={1.5}
              rowGap={1.5}
              pt={1}
            >
              <ToggleButtonGroup
                color="warning"
                value={activeFlags}
                onChange={handleFlagsChange}
                size="small"
                aria-label="task flags"
              >
                <ToggleButton value="urgent">Urgent</ToggleButton>
                <ToggleButton value="eod">EOD</ToggleButton>
                <ToggleButton value="important">Important</ToggleButton>
              </ToggleButtonGroup>

              <TextField
                select
                size="small"
                value={taskContext}
                onChange={e => setTaskContext(e.target.value as TaskContext)}
                slotProps={{
                  select: {
                    native: true,
                    sx: {
                      fontSize: theme.typography.body2.fontSize,
                      lineHeight: theme.typography.body2.lineHeight,
                      fontWeight: theme.typography.body2.fontWeight,
                    },
                  },
                }}
              >
                <option value="online">Online</option>
                <option value="out">Out</option>
                <option value="afk">AFK</option>
                <option value="talk">Talk</option>
              </TextField>

              <QuantitySelector
                value={duration}
                onValueChange={v => v !== null && setDuration(v)}
                step={20}
                minValue={1}
                maxValue={480}
                formatFn={formatDuration}
                parseFn={parseDuration}
              />

              {!isExpanded && (
                <Tooltip title="Expand options">
                  <IconButton size="small" onClick={() => setIsExpanded(true)}>
                    <UnfoldMoreIcon />
                  </IconButton>
                </Tooltip>
              )}

              {isExpanded && (
                <>
                  {/* Category selector */}
                  <TextField
                    select
                    size="small"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    slotProps={{
                      select: {
                        native: true,
                        sx: {
                          fontSize: theme.typography.body2.fontSize,
                          lineHeight: theme.typography.body2.lineHeight,
                          fontWeight: theme.typography.body2.fontWeight,
                        },
                      },
                    }}
                  >
                    <option value="" hidden>
                      Category
                    </option>
                    <option value="work">Work</option>
                    <option value="school">School</option>
                    <option value="hobby">Hobby</option>
                  </TextField>

                  {/* Quantity target */}
                  <QuantitySelector
                    value={quantityTarget}
                    onValueChange={v => setQuantityTarget(v ?? 1)}
                    minValue={1}
                    maxValue={10}
                    suffix="times"
                    singularSuffix="time"
                    hasSpace
                  />

                  {/* Blocked flag */}
                  <ToggleButtonGroup
                    color="warning"
                    value={activeFlags}
                    onChange={handleFlagsChange}
                    size="small"
                    aria-label="task flags"
                  >
                    <ToggleButton value="blocked" color="error">
                      Blocked
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <IconButton size="small" onClick={() => setIsExpanded(false)}>
                    <UnfoldLessIcon />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>
        </ClickAwayListener>
      </Collapse>
    </>
  );
}
