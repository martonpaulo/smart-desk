'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Chip, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { SelectTag } from '@/features/tag/components/SelectTag';
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
  eventId?: string;
  tagId?: string;
};

type TaskModalProps = {
  task?: Task | null; // undefined/null = new task
  newProperties?: Partial<Task>; // extra props for new tasks
  open: boolean;
  onCloseAction: () => void;
  // which fields are required to enable Save. Defaults to ['title']
  requiredFields?: Array<keyof TaskForm>;
  onSaved?: (updated: Task) => void;
};

export function TaskModal({
  task,
  open,
  onCloseAction,
  newProperties,
  requiredFields = ['title'],
  onSaved,
}: TaskModalProps) {
  const isMobile = useResponsiveness();

  const addTask = useBoardStore(s => s.addTask);
  const updateTask = useBoardStore(s => s.updateTask);

  const makeInitialForm = useCallback((): TaskForm => {
    const currentTask = { ...task, ...newProperties };

    // Helper respects explicit null from newProperties
    const fromNew = <K extends keyof Partial<Task>>(key: K) =>
      Object.prototype.hasOwnProperty.call(newProperties ?? {}, key)
        ? (newProperties as Partial<Task>)[key]
        : undefined;

    const plannedDate =
      currentTask?.plannedDate !== undefined
        ? currentTask.plannedDate
          ? new Date(currentTask.plannedDate)
          : undefined
        : ((fromNew('plannedDate') as Date | null | undefined) ?? undefined);

    const estimatedTime =
      currentTask?.estimatedTime !== undefined
        ? currentTask.estimatedTime
        : ((fromNew('estimatedTime') as number | undefined) ?? undefined);

    const tagId =
      currentTask?.tagId !== undefined
        ? currentTask.tagId
        : ((fromNew('tagId') as string | null | undefined) ?? undefined);

    const eventId =
      currentTask?.eventId !== undefined
        ? currentTask.eventId
        : ((fromNew('eventId') as string | null | undefined) ?? undefined);

    const base: TaskForm = {
      ...currentTask,
      title: currentTask?.title ?? '',
      notes: currentTask?.notes ?? '',
      useQuantity: (currentTask?.quantityTarget ?? 0) > 1,
      quantityTarget: currentTask?.quantityTarget ?? 1,
      daily: currentTask?.daily ?? false,
      important: currentTask?.important ?? false,
      urgent: currentTask?.urgent ?? false,
      blocked: currentTask?.blocked ?? false,
      plannedDate,
      estimatedTime: estimatedTime ?? undefined,
      tagId: tagId ?? (undefined as unknown as string | undefined),
      eventId: eventId ?? (undefined as unknown as string | undefined),
    };
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
    if (!task) return true;
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

  const isFieldFilled = useCallback(
    (key: keyof TaskForm): boolean => {
      const v = form[key];
      if (typeof v === 'string') return v.trim().length > 0;
      if (typeof v === 'number') return Number.isFinite(v);
      if (typeof v === 'boolean') return true;
      if (v instanceof Date) return !Number.isNaN(v.getTime());
      if (key === 'plannedDate') return !!form.plannedDate;
      if (key === 'estimatedTime') return typeof form.estimatedTime === 'number';
      if (key === 'tagId') return !!form.tagId;
      if (key === 'quantityTarget') return form.useQuantity ? form.quantityTarget >= 1 : true;
      if (key === 'notes') return form.notes.trim().length > 0;
      return v !== undefined && v !== null;
    },
    [form],
  );

  const isValid = useMemo(() => {
    return requiredFields.every(isFieldFilled);
  }, [requiredFields, isFieldFilled]);

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
      eventId: form.eventId,
    };

    const now = new Date();

    if (task?.id) {
      const updatedTask: Task = {
        ...task,
        ...payload,
        updatedAt: now,
      };
      await updateTask(updatedTask);
      onSaved?.(updatedTask);
    } else {
      const taskToCreate = { ...payload, updatedAt: now } as Task;
      const createdId = await addTask(taskToCreate);
      const created: Task = { ...taskToCreate, id: createdId };
      onSaved?.(created);
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
          minValue={0}
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

        <SelectTag tagId={form.tagId} onChange={tagId => setForm(prev => ({ ...prev, tagId }))} />
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
