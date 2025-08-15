'use client';

import { useState } from 'react';

import {
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { endOfToday, startOfToday } from 'date-fns';

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
import type { Task } from '@/legacy/types/task';
import { filterTodayEvents } from '@/legacy/utils/eventUtils';
import { CountChip } from '@/shared/components/CountChip';

export default function DayPlannerPage() {
  const theme = useTheme();
  const updateTask = useBoardStore(s => s.updateTask);

  const [showFuture, setShowFuture] = useState<boolean>(false);
  const [showEvents, setShowEvents] = useState<boolean>(true);

  const plannedToFilter = showFuture ? null : new Date();

  const allTasks = useTasks({ trashed: false, done: false, plannedTo: plannedToFilter });

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

  async function handleDropInbox(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!draggingId) return;
    const task = allTasks.find(t => t.id === draggingId);
    setDraggingId(null);
    if (!task) return;

    await updateTask({
      ...task,
      classifiedDate: undefined,
      updatedAt: new Date(),
    });
    playInterfaceSound('shift');
  }

  // state to defer drop until user fills required fields
  const [pendingDrop, setPendingDrop] = useState<{
    taskId: string;
    important: boolean;
    urgent: boolean;
  } | null>(null);

  const handleDropToQuadrant =
    (importantVal: boolean, urgentVal: boolean) => async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!draggingId) return;
      const task = allTasks.find(t => t.id === draggingId);
      setDraggingId(null);
      if (!task) return;

      // If missing required planning fields, open modal and finish later
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
  const allDayEvents = filterTodayEvents(events).filter(e => e.allDay);

  const quadrantTasks = (important: boolean, urgent: boolean) =>
    classifiedTasks.filter(t => t.important === important && t.urgent === urgent);

  const inboxCount = inboxTasks.length + (showEvents ? allDayEvents.length : 0);

  return (
    <PageSection
      title="Daily Planner"
      description="Plan your day, decide what matters, not just what screams for attention"
    >
      <Stack direction="row" gap={1} justifyContent="space-between" alignItems="center">
        <DailyTimeLoadIndicator />
        <TodoProgress />
      </Stack>

      <Stack direction="row" gap={2} mb={2} alignItems="center">
        <Button variant={isSelecting ? 'contained' : 'outlined'} onClick={toggleSelecting}>
          {isSelecting ? 'Cancel Selection' : 'Select Tasks'}
        </Button>

        <Tooltip title={showFuture ? 'Showing today and future' : 'Showing only today'}>
          <FormControlLabel
            control={
              <Switch
                checked={showFuture}
                onChange={() => setShowFuture(prev => !prev)}
                slotProps={{
                  input: { 'aria-label': 'Toggle future tasks' },
                }}
                size="small"
              />
            }
            label={showFuture ? 'Future on' : 'Future off'}
          />
        </Tooltip>

        <FormControlLabel
          control={
            <Switch
              checked={showEvents}
              onChange={() => setShowEvents(prev => !prev)}
              slotProps={{
                input: { 'aria-label': 'Toggle all-day events' },
              }}
              size="small"
            />
          }
          label={showEvents ? 'All-day events on' : 'All-day events off'}
        />
      </Stack>

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
            <CountChip count={inboxCount} color={theme.palette.primary.main} />
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            {showEvents &&
              allDayEvents.map(ev => (
                <ConvertibleEventCard key={ev.id} event={ev} disabled={isSelecting} />
              ))}
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

      {/* modal used to complete required planning fields when dropping */}
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
    </PageSection>
  );
}
