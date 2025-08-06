import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Box,
  Checkbox,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { useTagsStore } from '@/features/tag/store/useTagsStore';
import { QuantitySelector } from '@/legacy/components/QuantitySelector';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';
import { formatDuration, parseDuration } from '@/legacy/utils/timeUtils';
import { CustomDialog } from '@/shared/components/CustomDialog';
import { DateInput } from '@/shared/components/DateInput';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';

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
  tagId?: string;
}

interface TaskModalProps {
  task?: Task | null; // undefined/null = new task
  newProperties?: Partial<Task>; // additional properties for new tasks
  open: boolean;
  onClose: () => void;
}

export function TaskModal({ task, open, onClose, newProperties }: TaskModalProps) {
  // grab both actions in one subscription
  const addTask = useBoardStore(s => s.addTask);
  const updateTask = useBoardStore(s => s.updateTask);
  const allTags = useTagsStore(s => s.items);
  const tags = allTags.filter(t => !t.trashed).sort((a, b) => a.name.localeCompare(b.name));

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
      plannedDate: task?.plannedDate ? new Date(task?.plannedDate) : undefined,
      estimatedTime: task?.estimatedTime ?? undefined,
      tagId: task?.tagId ?? newProperties?.tagId,
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

  // compare each field to detect modifications
  const isModified = () => {
    if (!task) return true; // new task is always modified
    if (!open) return false; // closed modal is not modified

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
      form.plannedDate !== init.plannedDate ||
      form.estimatedTime !== init.estimatedTime ||
      form.tagId !== init.tagId
    );
  };

  // handle save or create
  const handleSave = async () => {
    const payload = {
      title: form.title.trim(),
      notes: form.notes.trim(),
      quantityDone: task?.quantityDone ?? 0,
      quantityTarget: form.useQuantity ? form.quantityTarget : 1,
      daily: form.daily,
      important: form.important,
      urgent: form.urgent,
      blocked: form.blocked,
      plannedDate: form.plannedDate ? new Date(form.plannedDate) : undefined,
      estimatedTime: form.estimatedTime,
      tagId: form.tagId,
    };

    if (task?.id) {
      await updateTask({
        ...payload,
        id: task.id,
        updatedAt: new Date(),
      });
    } else {
      await addTask({
        ...payload,
        updatedAt: new Date(),
      });
    }
  };

  // mark as trashed
  const handleDelete = async (id: string) => {
    await updateTask({
      id,
      trashed: true,
      updatedAt: new Date(),
    });
  };

  const handleDateChange = (value: Date | null) => {
    console.log('Date changed:', value);
    setForm(prev => ({ ...prev, plannedDate: value ?? undefined }));
  };

  return (
    <CustomDialog
      item="task"
      open={open}
      mode={task ? 'edit' : 'new'}
      isDirty={isModified()}
      isValid={form.title.trim() !== ''}
      onClose={onClose}
      onSave={handleSave}
      deleteAction={handleDelete}
      deleteId={task?.id}
      title={form.title}
      onTitleChange={value => setForm(f => ({ ...f, title: value }))}
      titlePlaceholder="What would you like to do?"
      titleLimit={32}
    >
      <Stack display="grid" gridTemplateColumns="1fr auto" alignItems="center">
        <DateInput label="Planned Date" value={form.plannedDate} onChange={handleDateChange} />

        <QuantitySelector
          value={form.estimatedTime ?? null}
          placeholder="not set"
          onValueChange={value => value !== null && setForm(f => ({ ...f, estimatedTime: value }))}
          step={20}
          minValue={1}
          maxValue={480}
          formatFn={formatDuration}
          parseFn={parseDuration}
          sx={{ ml: 2 }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
        <ToggleButtonGroup
          value={['daily', 'important', 'urgent', 'blocked'].filter(
            flag => form[flag as keyof TaskForm],
          )}
          onChange={(_e, newFlags) =>
            setForm(f => ({
              ...f,
              daily: newFlags.includes('daily'),
              important: newFlags.includes('important'),
              urgent: newFlags.includes('urgent'),
              blocked: newFlags.includes('blocked'),
            }))
          }
          aria-label="task flags"
          size="small"
        >
          <ToggleButton value="daily" aria-label="daily" color="info">
            Daily
          </ToggleButton>
          <ToggleButton value="important" aria-label="important" color="warning">
            Important
          </ToggleButton>
          <ToggleButton value="urgent" aria-label="urgent" color="warning">
            Urgent
          </ToggleButton>
          <ToggleButton value="blocked" aria-label="blocked" color="error">
            Blocked
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          select
          label="Tag"
          fullWidth
          size="small"
          value={form.tagId ?? ''}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              tagId: e.target.value === '' ? undefined : e.target.value,
            }))
          }
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          <MenuItem value="">No tag</MenuItem>
          {tags.map(t => (
            <MenuItem
              key={t.id}
              value={t.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Box
                sx={{
                  backgroundColor: t.color,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                }}
              />
              {t.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

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

      <MarkdownEditableBox
        label="Notes"
        placeholder="Enter a description"
        value={form.notes}
        onChange={e => setForm(f => ({ ...f, notes: e }))}
      />
    </CustomDialog>
  );
}
