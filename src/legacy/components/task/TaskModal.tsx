'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { TagLabel } from '@/features/tag/components/TagLabel';
import { useTagsStore } from '@/features/tag/store/useTagsStore';
import { QuantitySelector } from '@/legacy/components/QuantitySelector';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';
import { formatDuration, parseDuration } from '@/legacy/utils/timeUtils';
import { CustomDialog } from '@/shared/components/CustomDialog';
import { DateInput } from '@/shared/components/DateInput';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

type TaskForm = {
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
};

type TaskModalProps = {
  task?: Task | null; // undefined/null = new task
  newProperties?: Partial<Task>; // extra props for new tasks
  open: boolean;
  onCloseAction: () => void;
};

export function TaskModal({ task, open, onCloseAction, newProperties }: TaskModalProps) {
  const isMobile = useResponsiveness();

  const addTask = useBoardStore(s => s.addTask);
  const updateTask = useBoardStore(s => s.updateTask);

  const allTags = useTagsStore(s => s.items);
  const tags = allTags.filter(t => !t.trashed).sort((a, b) => a.name.localeCompare(b.name));

  const makeInitialForm = useCallback((): TaskForm => {
    const base: TaskForm = {
      title: task?.title ?? '',
      notes: task?.notes ?? '',
      useQuantity: (task?.quantityTarget ?? 0) > 1,
      quantityTarget: task?.quantityTarget ?? 1,
      daily: task?.daily ?? false,
      important: task?.important ?? false,
      urgent: task?.urgent ?? false,
      blocked: task?.blocked ?? false,
      plannedDate: task?.plannedDate ? new Date(task.plannedDate) : undefined,
      estimatedTime: task?.estimatedTime ?? undefined,
      tagId: task?.tagId ?? newProperties?.tagId,
      ...newProperties,
    };
    // ensure consistency
    if (!base.useQuantity) base.quantityTarget = 1;
    return base;
  }, [task, newProperties]);

  const [form, setForm] = useState<TaskForm>(makeInitialForm());
  const initialRef = useRef<TaskForm>(makeInitialForm());

  useEffect(() => {
    if (!open) return;
    const init = makeInitialForm();
    setForm(init);
    initialRef.current = init;
  }, [open, task, makeInitialForm]);

  const isDirty = useMemo(() => {
    const a = form;
    const b = initialRef.current;
    if (!task) return true; // new task considered dirty so Save is enabled when valid
    return (
      a.title.trim() !== b.title.trim() ||
      a.notes.trim() !== b.notes.trim() ||
      a.useQuantity !== b.useQuantity ||
      a.quantityTarget !== b.quantityTarget ||
      a.daily !== b.daily ||
      a.important !== b.important ||
      a.urgent !== b.urgent ||
      a.blocked !== b.blocked ||
      (a.plannedDate?.getTime() ?? null) !== (b.plannedDate?.getTime() ?? null) ||
      a.estimatedTime !== b.estimatedTime ||
      a.tagId !== b.tagId
    );
  }, [form, task]);

  const isValid = form.title.trim().length > 0;

  const handleSave = async () => {
    const payload: Partial<Task> = {
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
      await updateTask({ ...payload, id: task.id, updatedAt: new Date() } as Task);
    } else {
      await addTask({ ...payload, updatedAt: new Date() } as Task);
    }
  };

  const handleDelete = async (id: string) => {
    await updateTask({ id, trashed: true, updatedAt: new Date() });
  };

  const handleFlagsChange = (_: unknown, newFlags: string[]) => {
    setForm(f => ({
      ...f,
      daily: newFlags.includes('daily'),
      important: newFlags.includes('important'),
      urgent: newFlags.includes('urgent'),
      blocked: newFlags.includes('blocked'),
    }));
  };

  const activeFlags = [
    form.daily && 'daily',
    form.important && 'important',
    form.urgent && 'urgent',
    form.blocked && 'blocked',
  ].filter(Boolean) as string[];

  return (
    <CustomDialog
      item="task"
      open={open}
      mode={task ? 'edit' : 'new'}
      isDirty={isDirty}
      isValid={isValid}
      onClose={onCloseAction}
      onSave={handleSave}
      deleteAction={handleDelete}
      deleteId={task?.id}
      title={form.title}
      onTitleChange={value => setForm(f => ({ ...f, title: value }))}
      titlePlaceholder="What would you like to do?"
      titleLimit={32}
    >
      {/* Row 1: Date + Duration */}
      <Stack direction={isMobile ? 'column' : 'row'} gap={isMobile ? 1 : 2} alignItems="center">
        <DateInput
          label="Planned date"
          value={form.plannedDate ?? null}
          onChange={d => setForm(f => ({ ...f, plannedDate: d ?? undefined }))}
        />

        <QuantitySelector
          value={form.estimatedTime ?? null}
          placeholder="not set"
          onValueChange={v => v !== null && setForm(f => ({ ...f, estimatedTime: v }))}
          step={20}
          minValue={1}
          maxValue={480}
          formatFn={formatDuration}
          parseFn={parseDuration}
        />
      </Stack>

      {/* Row 2: Flags + Tag */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        gap={1}
        alignItems={isMobile ? 'stretch' : 'center'}
      >
        <ToggleButtonGroup
          value={activeFlags}
          onChange={handleFlagsChange}
          aria-label="task flags"
          size="small"
        >
          <ToggleButton value="daily" color="info">
            Daily
          </ToggleButton>
          <ToggleButton value="important" color="warning">
            Important
          </ToggleButton>
          <ToggleButton value="urgent" color="warning">
            Urgent
          </ToggleButton>
          <ToggleButton value="blocked" color="error">
            Blocked
          </ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" fullWidth>
          <InputLabel>Tag</InputLabel>
          <Select
            label="Tag"
            value={form.tagId ?? ''}
            onChange={(e: SelectChangeEvent<string>) =>
              setForm(prev => ({ ...prev, tagId: e.target.value || undefined }))
            }
            renderValue={val => {
              if (!val) return 'No tag';
              const tag = tags.find(t => t.id === val);
              return tag ? <TagLabel tag={tag} /> : 'No tag';
            }}
          >
            <MenuItem value="">No tag</MenuItem>
            {tags.map(t => (
              <MenuItem key={t.id} value={t.id}>
                <TagLabel tag={t} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Row 3: Quantity */}
      <Stack direction="row" alignItems="center" gap={1}>
        <ToggleButton
          value="useQuantity"
          selected={form.useQuantity}
          onChange={(_, sel) =>
            setForm(f => ({ ...f, useQuantity: sel, quantityTarget: sel ? f.quantityTarget : 1 }))
          }
          size="small"
        >
          Quantifiable
        </ToggleButton>

        <QuantitySelector
          disabled={!form.useQuantity}
          value={form.quantityTarget}
          minValue={1}
          maxValue={999}
          onValueChange={v => setForm(f => ({ ...f, quantityTarget: v ?? 1 }))}
        />

        {/* quick context chips (optional, can remove if unused) */}
        <Stack direction="row" gap={0.5} sx={{ ml: 'auto' }}>
          {form.important && <Chip size="small" color="warning" label="Important" />}
          {form.urgent && <Chip size="small" color="warning" label="Urgent" />}
          {form.blocked && <Chip size="small" color="error" label="Blocked" />}
          {form.daily && <Chip size="small" color="info" label="Daily" />}
        </Stack>
      </Stack>

      {/* Notes */}
      <MarkdownEditableBox
        label="Notes"
        placeholder="Enter a description"
        value={form.notes}
        onChange={e => setForm(f => ({ ...f, notes: e }))}
      />
    </CustomDialog>
  );
}
