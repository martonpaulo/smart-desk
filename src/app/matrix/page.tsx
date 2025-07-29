'use client';

import { useState } from 'react';

import { Button, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';

import { PageSection } from '@/core/components/PageSection';
import { eisenhowerQuadrants } from '@/features/eisenhower/config/eisenhowerQuadrants';
import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { TaskFilterPanel } from '@/features/task/components/TaskFilterPanel';
import { clearedFilters } from '@/features/task/constants/clearedFilters';
import { TaskFilters } from '@/features/task/types/TaskFilters';
import { EisenhowerQuadrant } from '@/legacy/components/EisenhowerQuadrant';
import { TaskSelectionToolbar } from '@/legacy/components/TaskSelectionToolbar';
import { useTasks } from '@/legacy/hooks/useTasks';
import { useTaskSelection } from '@/legacy/hooks/useTaskSelection';
import { useBoardStore } from '@/legacy/store/board/store';
import type { Task } from '@/legacy/types/task';

export default function EisenhowerMatrixPage() {
  const { enqueueSnackbar } = useSnackbar();
  const updateTask = useBoardStore(s => s.updateTask);

  const [filters, setFilters] = useState<TaskFilters>(clearedFilters);
  const allTasks = useTasks(filters);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const {
    isSelecting,
    selectedIds,
    selectedCount,
    toggleSelecting,
    selectTask,
    selectAll,
    clearSelection,
  } = useTaskSelection();

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
    (important: boolean, urgent: boolean) => async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!draggingId) return;

      const task = allTasks.find(t => t.id === draggingId);
      if (!task) {
        setDraggingId(null);
        return;
      }

      // early exit for same quadrant
      if (task.important === important && task.urgent === urgent) {
        setDraggingId(null);
        playInterfaceSound('snap');
        return;
      }

      // immediate feedback
      setDraggingId(null);
      playInterfaceSound('shift');

      await updateTask({
        id: draggingId,
        important,
        urgent,
        updatedAt: new Date(),
      });
    };

  const handleSetToToday = async () => {
    const today = new Date();
    const count = selectedIds.size;

    try {
      await Promise.all(
        Array.from(selectedIds).map(id => updateTask({ id, plannedDate: today, updatedAt: today })),
      );
      enqueueSnackbar(`Set ${count} task${count !== 1 ? 's' : ''} to today`, {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(`Failed to set tasks to today`, {
        variant: 'error',
      });
    }
    clearSelection();
  };

  const handleClearDate = async () => {
    const now = new Date();
    const count = selectedIds.size;
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          updateTask({ id, plannedDate: undefined, updatedAt: now }),
        ),
      );
      enqueueSnackbar(`Cleared date for ${count} task${count !== 1 ? 's' : ''}`, {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(`Failed to clear date for tasks`, {
        variant: 'error',
      });
    }
    clearSelection();
  };

  const handleMarkNone = async () => {
    const now = new Date();
    const count = selectedIds.size;
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          updateTask({ id, important: false, urgent: false, updatedAt: now }),
        ),
      );
      enqueueSnackbar(`Marked ${count} task${count !== 1 ? 's' : ''} as not important`, {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(`Failed to mark tasks as not important`, {
        variant: 'error',
      });
    }
    clearSelection();
  };

  const handleSelectAll = () => {
    const visible = allTasks.map(t => t.id);
    selectAll(visible);
  };

  return (
    <PageSection
      title="Eisenhower Matrix"
      description="Decide what matters, not just what screams for attention"
    >
      <TaskFilterPanel filters={filters} onFilterChange={setFilters} />

      <Stack direction="row" gap={2} mb={2}>
        <Button variant={isSelecting ? 'contained' : 'outlined'} onClick={toggleSelecting}>
          {isSelecting ? 'Cancel Selection' : 'Select Tasks'}
        </Button>
      </Stack>

      <Stack display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
        {eisenhowerQuadrants.map(
          ({ title, color, important, urgent, questions, examples, action }) => {
            const tasks = allTasks.filter(t => t.important === important && t.urgent === urgent);

            return (
              <EisenhowerQuadrant
                key={`${important}-${urgent}`}
                title={title}
                tasks={tasks}
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
                onTaskDrop={handleDrop(important, urgent)}
                selectable={isSelecting}
                selectedTaskIds={selectedIds}
                onTaskSelectChange={selectTask}
              />
            );
          },
        )}
      </Stack>

      {isSelecting && (
        <TaskSelectionToolbar
          selectedCount={selectedCount}
          onSelectAll={handleSelectAll}
          onSetToday={handleSetToToday}
          onClearDate={handleClearDate}
          onMarkNone={handleMarkNone}
          onCancel={toggleSelecting}
        />
      )}
    </PageSection>
  );
}
