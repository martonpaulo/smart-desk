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
import { TaskSelectAction } from '@/features/task/types/TaskSelectAction';
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

  const {
    isSelecting,
    selectedIds,
    selectTask,
    selectedCount,
    toggleSelecting,
    selectAll,
    selectNone,
    clearSelection,
  } = useTaskSelection();

  const totalCount = allTasks.length;
  const now = () => new Date();

  const handleSelectAll = () => {
    if (selectedCount !== totalCount) selectAll(allTasks.map(t => t.id));
  };
  const handleDeselectAll = () => {
    if (selectedCount > 0) selectNone();
  };
  const handleCancel = () => {
    toggleSelecting();
    clearSelection();
  };

  type BatchActions = {
    important: TaskSelectAction;
    urgent: TaskSelectAction;
    blocked: TaskSelectAction;
    daily: TaskSelectAction;
    trashed: TaskSelectAction;
    done: TaskSelectAction;
    plannedDate: Date | null;
    estimatedTime: number | null;
  };

  const handleApply = async (actions: BatchActions) => {
    const nowDate = now();
    const updates = Array.from(selectedIds).map(id => {
      const t = allTasks.find(x => x.id === id)!;
      const change: Partial<Task> & { id: string; updatedAt: Date } = {
        id,
        updatedAt: nowDate,
      };

      if (actions.important === 'set') change.important = true;
      if (actions.important === 'clear') change.important = false;

      if (actions.urgent === 'set') change.urgent = true;
      if (actions.urgent === 'clear') change.urgent = false;

      if (actions.blocked === 'set') change.blocked = true;
      if (actions.blocked === 'clear') change.blocked = false;

      if (actions.daily === 'set') change.daily = true;
      if (actions.daily === 'clear') change.daily = false;

      if (actions.trashed === 'set') change.trashed = true;
      if (actions.trashed === 'clear') change.trashed = false;

      if (actions.done === 'set') change.quantityDone = t.quantityTarget;
      if (actions.done === 'clear') change.quantityDone = 0;

      // use the date value or clear it
      if (actions.plannedDate !== null) {
        change.plannedDate = actions.plannedDate;
      } else {
        change.plannedDate = undefined;
      }

      // use the time value or clear it
      if (actions.estimatedTime != null) {
        change.estimatedTime = actions.estimatedTime;
      } else {
        change.estimatedTime = undefined;
      }

      return change;
    });

    try {
      await Promise.all(updates.map(u => updateTask(u)));
      enqueueSnackbar(`Updated ${selectedCount} task${selectedCount !== 1 ? 's' : ''}`, {
        variant: 'success',
      });
    } catch {
      enqueueSnackbar('Failed to update tasks', { variant: 'error' });
    } finally {
      clearSelection();
    }
  };

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (t: Task, e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(t.id);
  };

  const handleDragEnd = () => setDraggingId(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop =
    (important: boolean, urgent: boolean) => async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!draggingId) return;
      const t = allTasks.find(x => x.id === draggingId);
      if (!t) {
        setDraggingId(null);
        return;
      }
      if (t.important === important && t.urgent === urgent) {
        setDraggingId(null);
        playInterfaceSound('snap');
        return;
      }
      setDraggingId(null);
      playInterfaceSound('shift');
      await updateTask({ id: draggingId, important, urgent, updatedAt: new Date() });
    };

  return (
    <PageSection
      title="Eisenhower Matrix"
      description="Decide what matters, not just what screams for attention"
    >
      <TaskFilterPanel filters={filters} onFilterChange={setFilters} />

      <Stack direction="row" mb={2}>
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
          totalCount={totalCount}
          selectedCount={selectedCount}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      )}
    </PageSection>
  );
}
