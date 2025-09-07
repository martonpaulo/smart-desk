import { KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useState } from 'react';

import AddTaskIcon from '@mui/icons-material/AddTask';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
  Backdrop,
  ClickAwayListener,
  Collapse,
  IconButton,
  MenuItem,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { EventModal } from 'src/features/event/components/EventModal';
import { useTagsStore } from 'src/features/tag/store/useTagsStore';
import { QuantitySelector } from 'src/legacy/components/QuantitySelector';
import { useBoardStore } from 'src/legacy/store/board/store';
import { formatDuration, parseDuration } from 'src/legacy/utils/timeUtils';
import { DateInput } from 'src/shared/components/DateInput';
import { MarkdownEditableBox } from 'src/shared/components/MarkdownEditableBox';

export function AddTaskFloatButton() {
  const theme = useTheme();
  const zIndex = theme.zIndex.modal + 1;

  // Stores
  const { addTask } = useBoardStore(state => state);
  const allTags = useTagsStore(s => s.items);
  const tags = allTags.filter(t => !t.trashed).sort((a, b) => a.name.localeCompare(b.name));

  // SpeedDial open state
  const [dialOpen, setDialOpen] = useState(false);

  // Task modal state
  const [taskOpen, setTaskOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Event modal state
  const [eventOpen, setEventOpen] = useState(false);

  // Task form state
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [plannedDate, setPlannedDate] = useState<Date | undefined>(undefined);
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>(20);
  const [useQuantity, setUseQuantity] = useState(false);
  const [quantityTarget, setQuantityTarget] = useState(1);
  const [tagId, setTagId] = useState<string | undefined>(undefined);

  // Task flags
  const [important, setImportant] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [daily, setDaily] = useState(false);

  // Reset the task form to defaults
  const resetTaskForm = () => {
    setTitle('');
    setNotes('');
    setPlannedDate(undefined);
    setEstimatedTime(20);
    setUseQuantity(false);
    setQuantityTarget(1);
    setTagId(undefined);
    setImportant(false);
    setUrgent(false);
    setBlocked(false);
    setDaily(false);
    setIsExpanded(false);
  };

  // Openers and closers
  const openTaskForm = () => {
    setTaskOpen(true);
    setDialOpen(false);
  };

  const closeTaskForm = () => {
    setTaskOpen(false);
  };

  const openEventModal = () => {
    setEventOpen(true);
    setDialOpen(false);
  };

  const closeEventModal = () => setEventOpen(false);

  // Submit new task with basic validation
  const submitTask = useCallback(() => {
    const safeTitle = title.trim();
    if (!safeTitle) return;

    addTask({
      title: safeTitle,
      notes: notes.trim() || undefined,
      plannedDate: plannedDate ?? undefined,
      estimatedTime,
      quantityDone: 0,
      quantityTarget: useQuantity ? quantityTarget : 1,
      important,
      urgent,
      blocked,
      daily,
      tagId,
      updatedAt: new Date(),
    });

    closeTaskForm();
    resetTaskForm();
  }, [
    addTask,
    blocked,
    daily,
    estimatedTime,
    important,
    notes,
    plannedDate,
    quantityTarget,
    tagId,
    title,
    urgent,
    useQuantity,
  ]);

  // Keyboard shortcuts active only when task panel is open
  useEffect(() => {
    if (!taskOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTaskForm();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submitTask();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [taskOpen, submitTask]);

  // Flags logic for ToggleButtonGroup
  const activeFlags = [
    important && 'important',
    urgent && 'urgent',
    blocked && 'blocked',
    daily && 'daily',
  ].filter(Boolean) as string[];

  const handleFlagsChange = (_: unknown, newFlags: string[]) => {
    setImportant(newFlags.includes('important'));
    setUrgent(newFlags.includes('urgent'));
    setBlocked(newFlags.includes('blocked'));
    setDaily(newFlags.includes('daily'));
  };

  return (
    <>
      {/* Floating launcher with two actions */}

      <SpeedDial
        ariaLabel="Create"
        icon={<SpeedDialIcon />}
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onOpen={() => setDialOpen(true)}
        onClose={() => setDialOpen(false)}
        open={dialOpen}
      >
        <SpeedDialAction
          key="add-task"
          icon={<AddTaskIcon />}
          slotProps={{
            tooltip: {
              title: 'Add new task',
              open: false,
            },
          }}
          onClick={openTaskForm}
        />
        <SpeedDialAction
          key="add-event"
          icon={<EditCalendarIcon />}
          slotProps={{
            tooltip: {
              title: 'Add new event',
              open: false,
            },
          }}
          onClick={openEventModal}
        />
      </SpeedDial>

      {/* Event creation modal lives here too to avoid touching EventList */}
      <EventModal open={eventOpen} onClose={closeEventModal} />

      {/* Task sheet-style panel reuses your existing UI */}
      <Backdrop open={taskOpen} />
      <Collapse in={taskOpen} timeout="auto" unmountOnExit>
        <ClickAwayListener onClickAway={closeTaskForm}>
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
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* Title */}
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
                    <InputAdornment position="end">
                      <IconButton
                        onClick={submitTask}
                        disabled={!title.trim()}
                        size="small"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                        aria-label="Save task"
                      >
                        <AddTaskIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Planned Date + Estimated Time */}
            <Stack direction="row" gap={2} flexWrap="wrap">
              <DateInput
                label="Planned Date"
                value={plannedDate}
                onChange={v => setPlannedDate(v ?? undefined)}
              />
              <QuantitySelector
                value={estimatedTime ?? null}
                onValueChange={v => v !== null && setEstimatedTime(v)}
                step={20}
                minValue={1}
                maxValue={480}
                formatFn={formatDuration}
                parseFn={parseDuration}
              />
            </Stack>

            {/* Flags */}
            <ToggleButtonGroup
              value={activeFlags}
              onChange={handleFlagsChange}
              size="small"
              aria-label="task flags"
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value="important" color="warning">
                Important
              </ToggleButton>
              <ToggleButton value="urgent" color="warning">
                Urgent
              </ToggleButton>
              <ToggleButton value="blocked" color="error">
                Blocked
              </ToggleButton>
              <ToggleButton value="daily" color="info">
                Daily
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Expandable section */}
            {!isExpanded && (
              <IconButton size="small" onClick={() => setIsExpanded(true)} aria-label="Expand">
                <UnfoldMoreIcon />
              </IconButton>
            )}

            {isExpanded && (
              <>
                {/* Tag */}
                <TextField
                  select
                  label="Tag"
                  fullWidth
                  size="small"
                  value={tagId ?? ''}
                  onChange={e => setTagId(e.target.value || undefined)}
                >
                  <MenuItem value="">No tag</MenuItem>
                  {tags.map(t => (
                    <MenuItem key={t.id} value={t.id}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <span
                          style={{
                            backgroundColor: t.color,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                          }}
                        />
                        {t.name}
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>

                {/* Quantity */}
                <Stack direction="row" alignItems="center" gap={2}>
                  <ToggleButton
                    value="quantity"
                    selected={useQuantity}
                    onChange={() => setUseQuantity(!useQuantity)}
                  >
                    Quantifiable
                  </ToggleButton>
                  <QuantitySelector
                    disabled={!useQuantity}
                    value={quantityTarget}
                    minValue={1}
                    maxValue={999}
                    onValueChange={v => setQuantityTarget(v ?? 1)}
                    sx={{ ml: 2 }}
                  />
                </Stack>

                {/* Notes */}
                <MarkdownEditableBox
                  label="Notes"
                  placeholder="Enter a description"
                  value={notes}
                  onChange={v => setNotes(v)}
                />

                <IconButton size="small" onClick={() => setIsExpanded(false)} aria-label="Collapse">
                  <UnfoldLessIcon />
                </IconButton>
              </>
            )}
          </Stack>
        </ClickAwayListener>
      </Collapse>
    </>
  );
}
