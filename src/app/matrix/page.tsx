'use client';

import { useState } from 'react';

import { Stack } from '@mui/material';

import { EisenhowerQuadrant } from '@/components/EisenhowerQuadrant';
import { PageContentLayout } from '@/components/PageContentLayout';
import { eisenhowerQuadrants } from '@/config/eisenhowerQuadrants';
import { useTasks } from '@/hooks/useTasks';
import { useBoardStore } from '@/store/board/store';
import type { Task } from '@/types/task';

export default function EisenhowerMatrixPage() {
  const updateTask = useBoardStore(s => s.updateTask);
  const tasks = useBoardStore(s => s.tasks);
  const { activeTasks } = useTasks();

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (task: Task, e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(task.id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop =
    (important: boolean, urgent: boolean) => async (
      e: React.DragEvent<HTMLDivElement>,
    ) => {
      e.preventDefault();
      if (!draggingId) return;

      const task = tasks.find(t => t.id === draggingId);
      if (!task) {
        setDraggingId(null);
        return;
      }

      if (task.important === important && task.urgent === urgent) {
        setDraggingId(null);
        return;
      }

      await updateTask({
        id: draggingId,
        important,
        urgent,
        updatedAt: new Date(),
      });
      setDraggingId(null);
    };

  return (
    <PageContentLayout
      title="Eisenhower Matrix"
      description="Decide what matters, not just what screams for attention"
    >
      <Stack display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
        {eisenhowerQuadrants.map(({ title, color, important, urgent, signals, examples, action }) => {
          const tasks = activeTasks.filter(t => t.important === important && t.urgent === urgent);

          return (
            <EisenhowerQuadrant
              key={`${important}-${urgent}`}
              title={title}
              tasks={tasks}
              signals={signals}
              examples={examples}
              action={action}
              quadrantColor={color}
              important={important}
              urgent={urgent}
              isDragInProgress={!!draggingId}
              onTaskDragStart={handleDragStart}
              onTaskDragOver={handleDragOver}
              onTaskDragEnd={handleDragEnd}
              onTaskDrop={handleDrop(important, urgent)}
            />
          );
        })}
      </Stack>
    </PageContentLayout>
  );
}
