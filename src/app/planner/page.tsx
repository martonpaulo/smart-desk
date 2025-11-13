'use client';

import { Paper, Stack, Typography, useTheme } from '@mui/material';
import { isToday } from 'date-fns';
import { useMemo, useState } from 'react';

import { PageSection } from 'src/core/components/PageSection';
import { InboxSection } from 'src/features/eisenhower/components/InboxSection';
import { PendingDropModal } from 'src/features/eisenhower/components/PendingDropModal';
import { PlannerControls } from 'src/features/eisenhower/components/PlannerControl';
import { QuadrantGrid } from 'src/features/eisenhower/components/QuadrantGrid';
import { eisenhowerQuadrants } from 'src/features/eisenhower/config/eisenhowerQuadrants';
import { useDragState } from 'src/features/eisenhower/hooks/useDragState';
import { EventConversionModal } from 'src/features/event/components/EventConversionModal';
import { playInterfaceSound } from 'src/features/sound/utils/soundPlayer';
import { useBulkTaskSelection } from 'src/features/task/hooks/useBulkTaskSelection';
import { useCombinedEvents } from 'src/legacy/hooks/useCombinedEvents';
import { useTasks } from 'src/legacy/hooks/useTasks';
import { useBoardStore } from 'src/legacy/store/board/store';
import type { Event } from 'src/legacy/types/Event';
import type { Task } from 'src/legacy/types/task';
import { CountChip } from 'src/shared/components/CountChip';
import { ProgressBarIndicator } from 'src/shared/components/ProgressBarIndicator';
import { TimeLoadIndicator } from 'src/shared/components/TimeLoadIndicator';

type PendingDrop = {
  taskId: string;
  important: boolean;
  urgent: boolean;
};

export default function DayPlannerPage() {
  const theme = useTheme();
  const updateTask = useBoardStore(s => s.updateTask);
  const { data: events } = useCombinedEvents();

  const [showFuture, setShowFuture] = useState<boolean>(false);
  const [showEvents, setShowEvents] = useState<boolean>(true);

  // computed plannedTo filter for today vs today+future
  const plannedToFilter = showFuture ? null : new Date();

  // core task queries
  const allTasks = useTasks({ trashed: false, done: false, plannedTo: plannedToFilter });

  const isClassified = (task: Task) => {
    if (!task.classifiedDate) return false;
    return isToday(task.classifiedDate);
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

  // selection state
  const { isSelecting, selectedIds, toggleSelecting, selectTask } = useBulkTaskSelection(allTasks);

  // drag state
  const {
    draggingId,
    draggingKind,
    beginDragTask,
    beginDragEvent,
    endDrag,
    dragOverPreventDefault,
  } = useDragState();

  // drop on inbox clears classification if it was classified today
  async function handleDropInbox(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!draggingId || draggingKind !== 'task') return;
    const task = allTasks.find(t => t.id === draggingId);
    endDrag();
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

  // pending drop when task lacks required planning fields
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);

  // event to task modal prefill
  const [eventConversionTask, setEventConversionTask] = useState<Partial<Task> | null>(null);

  // drop handler factory to route task or event drops
  const handleDropToQuadrant =
    (importantVal: boolean, urgentVal: boolean) => async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!draggingId || !draggingKind) return;

      if (draggingKind === 'event') {
        const ev = events.find(x => x.id === draggingId) as Event | undefined;
        endDrag();
        if (!ev) return;

        // minimal defaults, keep same id flow via eventId
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

      const task = allTasks.find(t => t.id === draggingId);
      endDrag();
      if (!task) return;

      // no-op if class stays the same
      if (isClassified(task) && importantVal === task.important && urgentVal === task.urgent) {
        playInterfaceSound('snap');
        return;
      }

      // require estimatedTime before classify
      const needsPlanning = !task.estimatedTime;

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

  // events loading and filtered all day list
  const allDayEvents = useMemo(
    () => events.filter(e => e.allDay).filter(e => !allTasks.find(t => t.eventId === e.id)),
    [events, allTasks],
  );

  // quadrant tasks selector
  const quadrantTasks = (important: boolean, urgent: boolean) =>
    classifiedTasks.filter(t => t.important === important && t.urgent === urgent);

  const inboxCount = inboxTasks.length + (showEvents ? allDayEvents.length : 0);

  return (
    <PageSection
      title="Daily Planner"
      description="Decide what matters, not what screams"
      hideTitle
      hideDescription
    >
      <PlannerControls
        isSelecting={isSelecting}
        toggleSelectingAction={toggleSelecting}
        showFuture={showFuture}
        setShowFutureAction={setShowFuture}
        showEvents={showEvents}
        setShowEventsAction={setShowEvents}
        rightSlot={
          <Stack direction="row" gap={2} alignItems="center">
            <TimeLoadIndicator />
            <ProgressBarIndicator />
          </Stack>
        }
      />

      <Stack
        display="grid"
        gap={2}
        sx={{ gridTemplateColumns: { mobileSm: '1fr', mobileLg: '1fr 4fr' } }}
      >
        {/* Inbox column */}
        <Paper
          component="section"
          onDragOver={dragOverPreventDefault}
          onDrop={handleDropInbox}
          sx={{
            p: { mobileSm: 1.5, mobileLg: 2 },
            pb: { mobileSm: 2.5, mobileLg: 6 },
            boxShadow: 1,
            borderRadius: theme.shape.borderRadius,
            outline: '1px solid',
            outlineOffset: 0,
            outlineColor: 'divider',
            position: 'relative',
            '& *': { WebkitTapHighlightColor: 'transparent' },
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Typography variant="h3">Inbox</Typography>
            <CountChip count={inboxCount} color={theme.palette.primary.main} />
          </Stack>

          <InboxSection
            showEvents={showEvents}
            events={allDayEvents}
            tasks={inboxTasks}
            isSelecting={isSelecting}
            selectedIds={selectedIds}
            onSelectChangeAction={selectTask}
            onEventDragStartAction={beginDragEvent}
            onEventDragOverAction={dragOverPreventDefault}
            onEventDragEndAction={endDrag}
            onTaskDragStartAction={beginDragTask}
            onTaskDragOverAction={dragOverPreventDefault}
            onTaskDragEndAction={endDrag}
          />
        </Paper>

        {/* Quadrants grid */}
        <QuadrantGrid
          quadrants={eisenhowerQuadrants}
          getTasksAction={quadrantTasks}
          isDragInProgress={!!draggingId}
          onTaskDragStartAction={beginDragTask}
          onTaskDragOverAction={dragOverPreventDefault}
          onTaskDragEndAction={endDrag}
          onTaskDropFactoryAction={handleDropToQuadrant}
          selectedIds={selectedIds}
          selectable={isSelecting}
          onTaskSelectChangeAction={selectTask}
        />
      </Stack>

      <PendingDropModal
        open={!!pendingDrop}
        taskId={pendingDrop?.taskId}
        important={pendingDrop?.important ?? false}
        urgent={pendingDrop?.urgent ?? false}
        onCloseAction={() => setPendingDrop(null)}
        onSavedAction={updated => {
          const now = new Date();
          updateTask({ ...updated, classifiedDate: now, updatedAt: now });
          playInterfaceSound('shift');
          setPendingDrop(null);
        }}
        tasks={allTasks}
      />

      <EventConversionModal
        open={!!eventConversionTask}
        draft={eventConversionTask}
        onCloseAction={() => setEventConversionTask(null)}
        onSavedAction={saved => {
          const now = new Date();
          updateTask({ ...saved, classifiedDate: now, updatedAt: now });
          setEventConversionTask(null);
          playInterfaceSound('shift');
        }}
      />
    </PageSection>
  );
}
