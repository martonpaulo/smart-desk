'use client';

import { DragEvent } from 'react';

import { Stack, useTheme } from '@mui/material';

import { ConvertibleEventCard } from '@/features/event/components/ConvertibleEventCard';
import { TaskCard } from '@/legacy/components/task/TaskCard';
import type { Event } from '@/legacy/types/Event';
import type { Task } from '@/legacy/types/task';

type InboxSectionProps = {
  showEvents: boolean;
  events: Event[];
  tasks: Task[];
  isSelecting: boolean;
  selectedIds: Set<string>;
  onSelectChangeAction: (id: string, value: boolean) => void;
  onEventDragStartAction: (id: string, e: DragEvent<HTMLDivElement>) => void;
  onEventDragOverAction: (e: DragEvent<HTMLDivElement>) => void;
  onEventDragEndAction: () => void;
  onTaskDragStartAction: (task: Task, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragOverAction: (e: DragEvent<HTMLDivElement>) => void;
  onTaskDragEndAction: () => void;
};

export function InboxSection({
  showEvents,
  events,
  tasks,
  isSelecting,
  selectedIds,
  onSelectChangeAction,
  onEventDragStartAction,
  onEventDragOverAction,
  onEventDragEndAction,
  onTaskDragStartAction,
  onTaskDragOverAction,
  onTaskDragEndAction,
}: InboxSectionProps) {
  const theme = useTheme();

  return (
    <Stack direction="row" flexWrap="wrap" gap={1.5}>
      {showEvents &&
        events.map(ev => (
          <ConvertibleEventCard
            key={ev.id}
            event={ev}
            hasDefaultWidth={false}
            disabled={isSelecting}
            onTaskDragStart={(id, e) => onEventDragStartAction(id, e)}
            onTaskDragOver={(_id, e) => onEventDragOverAction(e)}
            onTaskDragEnd={onEventDragEndAction}
          />
        ))}

      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          dense
          hasDefaultWidth={false}
          color={theme.palette.primary.main}
          showActions={!isSelecting}
          selectable={isSelecting}
          selected={selectedIds.has(task.id)}
          onSelectChange={onSelectChangeAction}
          onTaskDragStart={(_id, e) => onTaskDragStartAction(task, e)}
          onTaskDragOver={(_id, e) => onTaskDragOverAction(e)}
          onTaskDragEnd={onTaskDragEndAction}
        />
      ))}
    </Stack>
  );
}
