import { useCallback, useEffect, useRef, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { QuantitySelector } from '@/components/QuantitySelector';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';
import { useBoardStore } from '@/store/board/store';
import { Task } from '@/types/task';
import { playInterfaceSound } from '@/utils/soundPlayer';
import { formatDuration, parseDuration, toLocalDateString } from '@/utils/timeUtils';

// all form fields in one object for easy compare
interface TaskForm {
  title: string;
  notes: string;
  useQuantity: boolean;
  quantityTarget: number;
  daily: boolean;
  important: boolean;
  urgent: boolean;
  blocked: boolean;
  plannedDate?: Date;
  estimatedTime?: number;
}

interface TaskModalProps {
  task?: Task | null; // undefined/null = new task
  newProperties?: Partial<Task>; // additional properties for new tasks
  open: boolean;
  onClose?: () => void;
}

export function TaskModal({ task, open, onClose, newProperties }: TaskModalProps) {
  // grab both actions in one subscription
  const addTask = useBoardStore(s => s.addTask);
  const updateTask = useBoardStore(s => s.updateTask);

  const [isTrashConfirmOpen, setTrashConfirmOpen] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  // initialize form from task or defaults
  const makeInitialForm = useCallback(
    (): TaskForm => ({
      title: task?.title ?? '',
      notes: task?.notes ?? '',
      useQuantity: (task?.quantityTarget ?? 0) > 1,
      quantityTarget: task?.quantityTarget ?? 1,
      daily: task?.daily ?? false,
      important: task?.important ?? false,
      urgent: task?.urgent ?? false,
      blocked: task?.blocked ?? false,
      plannedDate: task?.plannedDate ?? undefined,
      estimatedTime: task?.estimatedTime ?? undefined,
      ...newProperties, // spread any additional properties for new tasks
    }),
    [task, newProperties],
  );

  const [form, setForm] = useState<TaskForm>(makeInitialForm());

  // keep a ref of the initial form to compare dirty
  const initialRef = useRef<TaskForm>(makeInitialForm());

  // reset form whenever task or open changes
  useEffect(() => {
    if (!open) return;
    const init = makeInitialForm();
    setForm(init);
    initialRef.current = init;
  }, [task, open, makeInitialForm]);

  // focus title when dialog fully opens
  const handleTransitionEntered = () => {
    titleRef.current?.focus();
    const len = titleRef.current?.value.length ?? 0;
    titleRef.current?.setSelectionRange(len, len);
  };

  // compare each field to detect modifications
  const isModified = () => {
    const init = initialRef.current;
    return (
      form.title.trim() !== init.title.trim() ||
      form.notes.trim() !== init.notes.trim() ||
      form.useQuantity !== init.useQuantity ||
      form.quantityTarget !== init.quantityTarget ||
      form.daily !== init.daily ||
      form.important !== init.important ||
      form.urgent !== init.urgent ||
      form.blocked !== init.blocked ||
      (form.plannedDate?.getTime() ?? 0) !== (init.plannedDate?.getTime() ?? 0) ||
      form.estimatedTime !== init.estimatedTime
    );
  };

  // handle save or create
  const saveAndClose = () => {
    const title = form.title.trim();
    if (!title) return;
    if (!isModified()) {
      onClose?.();
      return;
    }

    const payload = {
      title,
      notes: form.notes.trim(),
      quantityDone: task?.quantityDone ?? 0,
      quantityTarget: form.useQuantity ? form.quantityTarget : 1,
      daily: form.daily,
      important: form.important,
      urgent: form.urgent,
      blocked: form.blocked,
      plannedDate: form.plannedDate ? new Date(form.plannedDate) : undefined,
      estimatedTime: form.estimatedTime,
    };

    try {
      if (task?.id) {
        updateTask({
          ...payload,
          id: task.id,
          updatedAt: new Date(),
        });
      } else {
        addTask({
          ...payload,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Task save failed', err);
    }

    onClose?.();
  };

  // mark as trashed
  const deleteAndClose = () => {
    if (!task) {
      onClose?.();
      return;
    }
    setTrashConfirmOpen(false);
    try {
      playInterfaceSound('trash');
      // mark as trashed instead of deleting
      updateTask({
        id: task.id,
        trashed: true,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error('Task delete failed', err);
    }
    onClose?.();
  };

  // Dialog onClose handler preserves original behavior:
  // escape only closes, other ways (backdrop click) save+close
  const handleClose: DialogProps['onClose'] = (_e, reason) => {
    switch (reason) {
      case 'escapeKeyDown':
        onClose?.();
        break;
      case 'backdropClick':
      default:
        if (form.title.trim()) {
          saveAndClose();
        } else {
          onClose?.();
        }
    }
  };

  const today = new Date();

  const disableTodayButton =
    form.plannedDate instanceof Date &&
    form.plannedDate.getDate() === today.getDate() &&
    form.plannedDate.getMonth() === today.getMonth() &&
    form.plannedDate.getFullYear() === today.getFullYear();

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="mobileLg"
      onClose={handleClose}
      slotProps={{ transition: { onEntered: handleTransitionEntered } }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        {task ? 'Edit Task' : 'New Task'}

        {task && (
          <Tooltip title="Delete task">
            <IconButton
              onClick={() => setTrashConfirmOpen(true)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* Title input */}
          <TextField
            label="Title"
            placeholder="What would you like to do?"
            fullWidth
            value={form.title}
            inputRef={titleRef}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                saveAndClose();
              }
            }}
          />

          <Stack direction="row" alignItems="center">
            <Typography variant="body2">Estimated Time</Typography>

            <QuantitySelector
              value={form.estimatedTime ?? null}
              placeholder="not set"
              onValueChange={value =>
                value !== null && setForm(f => ({ ...f, estimatedTime: value }))
              }
              step={20}
              minValue={1}
              maxValue={480}
              formatFn={formatDuration}
              parseFn={parseDuration}
              sx={{ ml: 2 }}
            />
          </Stack>

          {/* Planned date input */}

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Planned date selector */}
            <TextField
              label="Planned Date"
              type="date"
              fullWidth
              value={
                form.plannedDate instanceof Date
                  ? toLocalDateString(form.plannedDate)
                  : (form.plannedDate ?? '')
              }
              onChange={e => {
                const val = e.target.value;
                setForm(prev => ({
                  ...prev,
                  // avoid UTC shift by creating date with explicit time
                  plannedDate: val ? new Date(val + 'T00:00:00') : undefined,
                }));
              }}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  min: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .split('T')[0],
                },
              }}
            />

            <Button
              variant="contained"
              disableElevation
              size="large"
              disabled={disableTodayButton}
              onClick={() => setForm(prev => ({ ...prev, plannedDate: new Date() }))}
              sx={{ ml: 1 }}
            >
              Today
            </Button>
            <Button
              variant="outlined"
              size="large"
              disabled={!form.plannedDate}
              onClick={() => setForm(prev => ({ ...prev, plannedDate: undefined }))}
              sx={{ ml: 1 }}
            >
              Clear
            </Button>
          </Stack>

          {/* Quantifiable option */}
          <Stack>
            <Stack direction="row" alignItems="center">
              <Checkbox
                checked={form.useQuantity}
                onChange={(_, checked) =>
                  setForm(f => ({
                    ...f,
                    useQuantity: checked,
                    quantityTarget: checked ? f.quantityTarget : 1,
                  }))
                }
              />
              <Typography variant="body2">Quantifiable</Typography>
              <QuantitySelector
                disabled={!form.useQuantity}
                value={form.quantityTarget}
                minValue={1}
                maxValue={999}
                onValueChange={value => setForm(f => ({ ...f, quantityTarget: value }))}
                sx={{ ml: 2 }}
              />
            </Stack>

            {/* Daily, Important, Urgent, Blocked flags */}
            {['daily', 'important', 'urgent', 'blocked'].map(flag => (
              <Stack key={flag} direction="row" alignItems="center">
                <Checkbox
                  checked={form[flag as keyof TaskForm] as boolean}
                  onChange={(_, checked) =>
                    setForm(f => ({
                      ...f,
                      [flag]: checked,
                    }))
                  }
                />
                <Typography variant="body2">
                  {flag.charAt(0).toUpperCase() + flag.slice(1)}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Notes */}
          <MarkdownEditableBox
            label="Notes"
            placeholder="Enter a description"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e }))}
          />
        </Stack>
      </DialogContent>

      <ConfirmDialog
        open={isTrashConfirmOpen}
        title="Confirm Delete"
        content="Are you sure you want to send this task to the <strong>trash</strong>? You can restore it later."
        onCancel={() => setTrashConfirmOpen(false)}
        onConfirm={deleteAndClose}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </Dialog>
  );
}
