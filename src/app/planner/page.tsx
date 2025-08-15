'use client';

import { useState } from 'react';

import {
  Button,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { endOfToday, isToday, startOfToday } from 'date-fns';

import { PageSection } from '@/core/components/PageSection';
import { eisenhowerQuadrants } from '@/features/eisenhower/config/eisenhowerQuadrants';
import { ConvertibleEventCard } from '@/features/event/components/ConvertibleEventCard';
import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { useBulkTaskSelection } from '@/features/task/hooks/useBulkTaskSelection';
import { DailyTimeLoadIndicator } from '@/legacy/components/DailyTimeLoadIndicator';
import { EisenhowerQuadrant } from '@/legacy/components/EisenhowerQuadrant';
import { TodoProgress } from '@/legacy/components/Progress';
import { TaskCard } from '@/legacy/components/task/TaskCard';
import { TaskModal } from '@/legacy/components/task/TaskModal';
import { TaskSelectionToolbar } from '@/legacy/components/TaskSelectionToolbar';
import { useEvents } from '@/legacy/hooks/useEvents';
import { useTasks } from '@/legacy/hooks/useTasks';
import { useBoardStore } from '@/legacy/store/board/store';
import { useEventStore } from '@/legacy/store/eventStore';
import type { Event } from '@/legacy/types/Event';
import type { Task } from '@/legacy/types/task';
import { filterTodayEvents } from '@/legacy/utils/eventUtils';
import { CountChip } from '@/shared/components/CountChip';

type DragKind = 'task' | 'event' | null;

export default function DayPlannerPage() {
  const theme = useTheme();
  const updateTask = useBoardStore(s => s.updateTask);

  const [showFuture, setShowFuture] = useState<boolean>(false);
  const [showEvents, setShowEvents] = useState<boolean>(true);

  const plannedToFilter = showFuture ? null : new Date();

  const allTasks = useTasks({ trashed: false, done: false, plannedTo: plannedToFilter });

  const isClassified = (task: Task) => {
    if (!task.classifiedDate) return false;
    return !isToday(task.classifiedDate);
  };

  const inboxTasks = useTasks({
    trashed: false,
    done: false,
    plannedTo: plannedToFilter,
    classified: false,
  });
  const classifiedTasks = useTasks({
    trashed: false,
    done: false,
    plannedTo: plannedToFilter,
    classified: true,
  });

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

  // track dragging source
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingKind, setDraggingKind] = useState<DragKind>(null);

  function handleDragStart(task: Task, e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(task.id);
    setDraggingKind('task');
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDraggingKind(null);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function handleDropInbox(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!draggingId || draggingKind !== 'task') return;
    const task = allTasks.find(t => t.id === draggingId);
    setDraggingId(null);
    setDraggingKind(null);
    if (!task) return;

    if (!isClassified(task)) {
      playInterfaceSound('snap');
      return;
    }

    await updateTask({
      ...task,
      classifiedDate: undefined,
      updatedAt: new Date(),
    });
    playInterfaceSound('shift');
  }

  // state to defer drop until user fills required fields (for tasks)
  const [pendingDrop, setPendingDrop] = useState<{
    taskId: string;
    important: boolean;
    urgent: boolean;
  } | null>(null);

  // state to open modal for event → task conversion
  const [eventConversionTask, setEventConversionTask] = useState<Partial<Task> | null>(null);

  const handleDropToQuadrant =
    (importantVal: boolean, urgentVal: boolean) => async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!draggingId || !draggingKind) return;

      // Dropping an EVENT → open TaskModal prefilled, keep same id, then classify on save
      if (draggingKind === 'event') {
        const eventsState = useEventStore.getState().events as Event[];
        const ev = eventsState.find(x => x.id === draggingId);
        setDraggingId(null);
        setDraggingKind(null);
        if (!ev) return;

        // minimal, safe defaults, keep same id
        const draftTask: Partial<Task> = {
          eventId: ev.id,
          title: ev.title || 'Untitled Event',
          notes: ev.description || '',
          important: importantVal,
          urgent: urgentVal,
          plannedDate: new Date(),
        };

        setEventConversionTask(draftTask);
        playInterfaceSound('shift');
        return;
      }

      // Dropping a TASK → existing behavior with required checks
      const task = allTasks.find(t => t.id === draggingId);
      setDraggingId(null);
      setDraggingKind(null);
      if (!task) return;

      if (isClassified(task) && importantVal === task.important && urgentVal === task.urgent) {
        playInterfaceSound('snap');
        return;
      }

      const needsPlanning = !task.plannedDate || !task.estimatedTime;
      if (needsPlanning) {
        setPendingDrop({ taskId: task.id, important: importantVal, urgent: urgentVal });
        playInterfaceSound('error');
        return;
      }

      const today = new Date();

      await updateTask({
        ...task,
        classifiedDate: today,
        important: importantVal,
        urgent: urgentVal,
        plannedDate: today,
        updatedAt: today,
      });

      playInterfaceSound('shift');
    };

  useEvents(startOfToday(), endOfToday());
  const events = useEventStore(s => s.events);
  const allDayEvents = filterTodayEvents(events)
    .filter(e => e.allDay)
    .filter(e => !allTasks.find(t => t.eventId === e.id));

  const quadrantTasks = (important: boolean, urgent: boolean) =>
    classifiedTasks.filter(t => t.important === important && t.urgent === urgent);

  const inboxCount = inboxTasks.length + (showEvents ? allDayEvents.length : 0);

  return (
    <PageSection
      title="Daily Planner"
      description="Plan your day, decide what matters, not just what screams for attention"
      hideTitle
      hideDescription
    >
      <Stack direction="row" gap={2} mb={2} alignItems="center" justifyContent="space-between">
        <Stack gap={2} direction="row" alignItems="center">
          <Button variant={isSelecting ? 'contained' : 'outlined'} onClick={toggleSelecting}>
            {isSelecting ? 'Cancel Selection' : 'Select Tasks'}
          </Button>

          <ToggleButtonGroup
            size="small"
            value={[showFuture ? 'future' : null, showEvents ? 'events' : null].filter(Boolean)}
            onChange={(_, newValues) => {
              setShowFuture(newValues.includes('future'));
              setShowEvents(newValues.includes('events'));
            }}
            color="secondary"
          >
            <Tooltip title={showFuture ? 'Showing today and future' : 'Showing only today'}>
              <ToggleButton value="future" aria-label="Toggle future tasks">
                {showFuture ? 'Include Upcoming' : 'Hide Upcoming'}
              </ToggleButton>
            </Tooltip>

            <Tooltip title={showEvents ? 'Showing all-day events' : 'Hiding all-day events'}>
              <ToggleButton value="events" aria-label="Toggle all-day events">
                {showEvents ? 'Include Events' : 'Hide Events'}
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" gap={2} justifyContent="space-between" alignItems="center">
          <DailyTimeLoadIndicator />
          <TodoProgress />
        </Stack>
      </Stack>

      <Stack
        display="grid"
        gap={2}
        sx={{ gridTemplateColumns: { mobileSm: '1fr', mobileLg: '1fr 4fr' } }}
      >
        <Paper
          component="section"
          onDragOver={handleDragOver}
          onDrop={handleDropInbox}
          sx={{
            p: { mobileSm: 1.5, mobileLg: 2 },
            pb: { mobileSm: 2.5, mobileLg: 6 },
            boxShadow: 1,
            borderRadius: theme.shape.borderRadius,
            outline: '1px solid',
            outlineOffset: '0',
            outlineColor: 'divider',
            position: 'relative',
            '& *': { WebkitTapHighlightColor: 'transparent' },
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6">Inbox</Typography>
            <CountChip count={inboxCount} color={theme.palette.primary.main} />
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            {showEvents &&
              allDayEvents.map(ev => (
                <ConvertibleEventCard
                  key={ev.id}
                  event={ev}
                  disabled={isSelecting}
                  // wire event drag into the same DnD pipeline, but mark kind as 'event'
                  onTaskDragStart={(id, e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggingId(id);
                    setDraggingKind('event');
                  }}
                  onTaskDragOver={(_id, e) => handleDragOver(e)}
                  onTaskDragEnd={() => {
                    setDraggingId(null);
                    setDraggingKind(null);
                  }}
                />
              ))}

            {inboxTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                hasDefaultWidth={false}
                color={theme.palette.primary.main}
                showActions={!isSelecting}
                selectable={isSelecting}
                selected={selectedIds.has(task.id)}
                onSelectChange={selectTask}
                onTaskDragStart={(_id, e) => handleDragStart(task, e)}
                onTaskDragOver={(_id, e) => handleDragOver(e)}
                onTaskDragEnd={handleDragEnd}
              />
            ))}
          </Stack>
        </Paper>

        <Stack
          display="grid"
          gap={2}
          height="85vh"
          sx={{
            gridTemplateColumns: { mobileSm: '1fr', mobileLg: '1fr 1fr' },
            gridTemplateRows: { mobileSm: 'repeat(2, 1fr)', mobileLg: '1fr' },
          }}
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

      {/* existing modal for completing required planning fields when dropping a TASK */}
      <TaskModal
        open={!!pendingDrop}
        task={pendingDrop ? allTasks.find(t => t.id === pendingDrop.taskId) : undefined}
        newProperties={
          pendingDrop ? { important: pendingDrop.important, urgent: pendingDrop.urgent } : undefined
        }
        requiredFields={['title', 'plannedDate', 'estimatedTime']}
        onCloseAction={() => setPendingDrop(null)}
        onSaved={updated => {
          // set classified date to today
          const today = new Date();
          updateTask({ ...updated, classifiedDate: today, plannedDate: today, updatedAt: today });
          playInterfaceSound('shift');
          setPendingDrop(null);
        }}
      />

      {/* modal to convert EVENT → TASK with same id */}
      <TaskModal
        open={!!eventConversionTask}
        requiredFields={['title', 'plannedDate', 'estimatedTime']}
        newProperties={{
          ...eventConversionTask,
          important: eventConversionTask?.important,
          urgent: eventConversionTask?.urgent,
        }}
        onCloseAction={() => setEventConversionTask(null)}
        onSaved={saved => {
          const today = new Date();
          // finalize classification on save
          updateTask({
            ...saved,
            important: saved.important,
            urgent: saved.urgent,
            classifiedDate: today,
            updatedAt: today,
          });
          // hide the original event in UI
          setEventConversionTask(null);
          playInterfaceSound('shift');
        }}
      />
    </PageSection>
  );
}
