'use client';

import { DragEvent } from 'react';

import { Stack } from '@mui/material';
import { EisenhowerQuadrant } from 'src/legacy/components/EisenhowerQuadrant';
import type { Task } from 'src/legacy/types/task';

type QuadrantConfig = {
  title: string;
  color: string;
  important: boolean;
  urgent: boolean;
  questions: string[];
  examples: string[];
  action: string;
};

type QuadrantGridProps = {
  quadrants: QuadrantConfig[];
  getTasksAction: (important: boolean, urgent: boolean) => Task[];
  isDragInProgress: boolean;
  onTaskDragStartAction: (task: Task, e: DragEvent<HTMLDivElement>) => void;
  onTaskDragOverAction: (e: DragEvent<HTMLDivElement>) => void;
  onTaskDragEndAction: () => void;
  onTaskDropFactoryAction: (
    important: boolean,
    urgent: boolean,
  ) => (e: DragEvent<HTMLDivElement>) => void;
  selectable: boolean;
  selectedIds: Set<string>;
  onTaskSelectChangeAction: (id: string, value: boolean) => void;
};

export function QuadrantGrid({
  quadrants,
  getTasksAction,
  isDragInProgress,
  onTaskDragStartAction,
  onTaskDragOverAction,
  onTaskDragEndAction,
  onTaskDropFactoryAction,
  selectable,
  selectedIds,
  onTaskSelectChangeAction,
}: QuadrantGridProps) {
  return (
    <Stack
      display="grid"
      gap={2}
      height="85vh"
      sx={{
        gridTemplateColumns: { mobileSm: '1fr', mobileLg: '1fr 1fr' },
        gridTemplateRows: { mobileSm: 'repeat(2, 1fr)', mobileLg: '1fr' },
      }}
    >
      {quadrants.map(({ title, color, important, urgent, questions, examples, action }) => (
        <EisenhowerQuadrant
          key={`${important}-${urgent}`}
          title={title}
          tasks={getTasksAction(important, urgent)}
          questions={questions}
          examples={examples}
          action={action}
          quadrantColor={color}
          important={important}
          urgent={urgent}
          isDragInProgress={isDragInProgress}
          onTaskDragStart={onTaskDragStartAction}
          onTaskDragOver={onTaskDragOverAction}
          onTaskDragEnd={onTaskDragEndAction}
          onTaskDrop={onTaskDropFactoryAction(important, urgent)}
          selectable={selectable}
          selectedTaskIds={selectedIds}
          onTaskSelectChange={onTaskSelectChangeAction}
        />
      ))}
    </Stack>
  );
}
