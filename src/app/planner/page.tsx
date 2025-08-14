'use client';

import { useEffect, useState } from 'react';

import {
  Button,
  Drawer,
  Paper,
  Popover,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { eisenhowerQuadrants } from '@/features/eisenhower/config/eisenhowerQuadrants';
import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { useBulkTaskSelection } from '@/features/task/hooks/useBulkTaskSelection';
import { usePlannableTasks } from '@/features/task/hooks/usePlannableTasks';
import {
  classifyTask,
  ensureDuration,
  ensurePlannedDate,
} from '@/features/task/utils/planning';
import { EisenhowerQuadrant } from '@/legacy/components/EisenhowerQuadrant';
import { TaskCard } from '@/legacy/components/task/TaskCard';
import { TaskSelectionToolbar } from '@/legacy/components/TaskSelectionToolbar';
import { useBoardStore } from '@/legacy/store/board/store';
import { useEventStore } from '@/legacy/store/eventStore';
import type { Event } from '@/legacy/types/Event';
import type { Task } from '@/legacy/types/task';
import { filterTodayEvents } from '@/legacy/utils/eventUtils';
import { CountChip } from '@/shared/components/CountChip';

export default function DayPlannerPage() {
  const theme = useTheme();
  const updateTask = useBoardStore(s => s.updateTask);
  const addTask = useBoardStore(s => s.addTask);
  const allTasks = usePlannableTasks();
  const [inboxIds, setInboxIds] = useState<string[]>([]);
  useEffect(() => setInboxIds(allTasks.map(t => t.id)), [allTasks]);

  const {
    isSelecting,
    selectedIds,
    toggleSelecting,
    selectedCount,
    selectTask,
    totalCount,
    handleSelectAll,
    handleDeselectAll,
    handleCancel,
    handleApply,
  } = useBulkTaskSelection(allTasks);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  function handleDragStart(task: Task, e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(task.id);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDropInbox(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!draggingId) return;
    const task = allTasks.find(t => t.id === draggingId);
    setDraggingId(null);
    if (!task) return;
    setInboxIds(ids => (ids.includes(task.id) ? ids : [...ids, task.id]));
    if (task.important || task.urgent) {
      void updateTask({
        id: task.id,
        important: false,
        urgent: false,
        updatedAt: new Date(),
      });
    }
  }

  const handleDropToQuadrant =
    (importantVal: boolean, urgentVal: boolean) => async (
      e: React.DragEvent<HTMLDivElement>,
    ) => {
      e.preventDefault();
      if (!draggingId) return;
      const task = allTasks.find(t => t.id === draggingId);
      setDraggingId(null);
      if (!task) return;
      const classified = classifyTask(task, {
        important: importantVal,
        urgent: urgentVal,
      });
      const planned = ensurePlannedDate(classified);
      const duration = ensureDuration(classified);
      await updateTask({
        id: task.id,
        important: importantVal,
        urgent: urgentVal,
        plannedDate: planned,
        estimatedTime: duration,
        updatedAt: new Date(),
      });
      setInboxIds(ids => ids.filter(id => id !== task.id));
      playInterfaceSound('shift');
    };

  function handleQuickEditDate(task: Task, date: Date | null) {
    void updateTask({ id: task.id, plannedDate: date ?? undefined, updatedAt: new Date() });
  }

  function handleQuickEditDuration(task: Task, minutes: number) {
    void updateTask({ id: task.id, estimatedTime: minutes, updatedAt: new Date() });
  }

  function planAllForToday() {
    const today = new Date();
    allTasks
      .filter(t => !t.plannedDate)
      .forEach(t =>
        updateTask({ id: t.id, plannedDate: today, updatedAt: new Date() }),
      );
  }

  const [durationAnchor, setDurationAnchor] = useState<HTMLElement | null>(null);
  const openDurationPopover = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDurationAnchor(e.currentTarget);
  };
  const closeDurationPopover = () => setDurationAnchor(null);
  function applyDefaultDuration(minutes: number) {
    selectedIds.forEach(id =>
      updateTask({ id, estimatedTime: minutes, updatedAt: new Date() }),
    );
    closeDurationPopover();
  }

  const [eventsOpen, setEventsOpen] = useState(false);
  const events = useEventStore(s => s.events);
  const allDayEvents = filterTodayEvents(events).filter(e => e.allDay);
  const tasks = useBoardStore(s => s.tasks);

  function isEventConverted(ev: Event): boolean {
    return tasks.some(t => t.notes?.includes(`event:${ev.id}`));
  }

  async function convertEvent(ev: Event) {
    if (isEventConverted(ev)) return;
    const duration = ensureDuration({ estimatedTime: undefined } as Task);
    await addTask({
      title: ev.title,
      notes: ev.description ? `${ev.description}\n[event:${ev.id}]` : `[event:${ev.id}]`,
      plannedDate: new Date(),
      estimatedTime: duration,
      important: false,
      urgent: false,
      updatedAt: new Date(),
    });
  }

  function convertAllEvents() {
    if (!window.confirm('Convert all all-day events?')) return;
    allDayEvents.forEach(ev => void convertEvent(ev));
  }

  const inboxTasks = allTasks.filter(t => inboxIds.includes(t.id));
  const quadrantTasks = (important: boolean, urgent: boolean) =>
    allTasks.filter(
      t => !inboxIds.includes(t.id) && t.important === important && t.urgent === urgent,
    );

  return (
    <PageSection title="Daily Planner" description="Prepare your day">
      <Stack direction="row" gap={2} mb={2} alignItems="center">
        <Button variant="outlined" onClick={planAllForToday}>
          Plan all for today
        </Button>
        <Button
          variant="outlined"
          onClick={openDurationPopover}
          disabled={!isSelecting || selectedCount === 0}
        >
          Set default duration
        </Button>
        <Button
          variant={isSelecting ? 'contained' : 'outlined'}
          onClick={toggleSelecting}
        >
          {isSelecting ? 'Cancel Selection' : 'Select Tasks'}
        </Button>
        <Button variant="outlined" onClick={() => setEventsOpen(true)}>
          All-day events
        </Button>
      </Stack>

      <Popover
        open={Boolean(durationAnchor)}
        anchorEl={durationAnchor}
        onClose={closeDurationPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Stack p={2} gap={1}>
          {[20, 40, 60].map(min => (
            <Button key={min} onClick={() => applyDefaultDuration(min)}>
              {min} min
            </Button>
          ))}
        </Stack>
      </Popover>

      <Stack direction={{ mobileSm: 'column', mobileLg: 'row' }} gap={2}>
        <Paper
          onDragOver={handleDragOver}
          onDrop={handleDropInbox}
          sx={{
            p: 2,
            boxShadow: 1,
            minHeight: { mobileSm: 220, mobileLg: 320 },
            flex: `0 0 ${theme.spacing(35)}`,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6">Inbox</Typography>
            <CountChip count={inboxTasks.length} color={theme.palette.primary.main} />
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            {inboxTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                color={theme.palette.primary.main}
                showActions={!isSelecting}
                selectable={isSelecting}
                selected={selectedIds.has(task.id)}
                onSelectChange={selectTask}
                onTaskDragStart={(_id, e) => handleDragStart(task, e)}
                onTaskDragOver={(_id, e) => handleDragOver(e)}
                onTaskDragEnd={handleDragEnd}
                onQuickEditDate={handleQuickEditDate}
                onQuickEditDuration={handleQuickEditDuration}
              />
            ))}
          </Stack>
        </Paper>

        <Stack
          display="grid"
          gap={2}
          sx={{ gridTemplateColumns: { mobileSm: '1fr', mobileLg: '1fr 1fr' } }}
        >
          {eisenhowerQuadrants.map(
            ({ title, color, important, urgent, questions, examples, action }) => (
              <EisenhowerQuadrant
                key={`${important}-${urgent}`}
                title={title}
                tasks={quadrantTasks(important, urgent)}
                questions={questions}
                examples={examples}
                action={action}
                quadrantColor={color}
                important={important}
                urgent={urgent}
                isDragInProgress={!!draggingId}
                onTaskDragStart={handleDragStart}
                onTaskDragOver={handleDragOver}
                onTaskDragEnd={handleDragEnd}
                onTaskDrop={handleDropToQuadrant(important, urgent)}
                selectable={isSelecting}
                selectedTaskIds={selectedIds}
                onTaskSelectChange={selectTask}
                onQuickEditDate={handleQuickEditDate}
                onQuickEditDuration={handleQuickEditDuration}
              />
            ),
          )}
        </Stack>
      </Stack>

      {isSelecting && (
        <TaskSelectionToolbar
          totalCount={totalCount}
          selectedCount={selectedCount}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      )}

      <Drawer anchor="right" open={eventsOpen} onClose={() => setEventsOpen(false)}>
        <Stack p={2} gap={2} sx={{ width: { mobileSm: 280, mobileLg: 360 } }}>
          <Typography variant="h6">Today&apos;s all-day events</Typography>
          {allDayEvents.length === 0 ? (
            <Typography variant="body2">No all-day events</Typography>
          ) : (
            <>
              {allDayEvents.map(ev => (
                <Stack key={ev.id} direction="row" justifyContent="space-between" gap={1}>
                  <Stack>
                    <Typography variant="subtitle2">{ev.title}</Typography>
                    {ev.description && (
                      <Typography variant="caption" color="text.secondary">
                        {ev.description}
                      </Typography>
                    )}
                  </Stack>
                  <Button
                    size="small"
                    disabled={isEventConverted(ev)}
                    onClick={() => void convertEvent(ev)}
                  >
                    {isEventConverted(ev) ? 'Converted' : 'Convert to Task'}
                  </Button>
                </Stack>
              ))}
              <Button onClick={convertAllEvents}>Convert all</Button>
            </>
          )}
        </Stack>
      </Drawer>
    </PageSection>
  );
}
