'use client';

import { DragEvent, useCallback, useState } from 'react';

import type { Task } from '@/legacy/types/task';

export type DragKind = 'task' | 'event' | null;

export function useDragState() {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingKind, setDraggingKind] = useState<DragKind>(null);

  // standard prevent default for droppable areas
  const dragOverPreventDefault = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const beginDragTask = useCallback((task: Task, e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(task.id);
    setDraggingKind('task');
  }, []);

  const beginDragEvent = useCallback((id: string, e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
    setDraggingKind('event');
  }, []);

  const endDrag = useCallback(() => {
    setDraggingId(null);
    setDraggingKind(null);
  }, []);

  return {
    draggingId,
    draggingKind,
    dragOverPreventDefault,
    beginDragTask,
    beginDragEvent,
    endDrag,
  };
}
