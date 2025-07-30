'use client';

import { useState } from 'react';

import { Button, Stack } from '@mui/material';

import { PageSection } from '@/core/components/PageSection';
import { eisenhowerQuadrants } from '@/features/eisenhower/config/eisenhowerQuadrants';
import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { TaskFilterPanel } from '@/features/task/components/TaskFilterPanel';
import { clearedFilters } from '@/features/task/constants/clearedFilters';
import { useBulkTaskSelection } from '@/features/task/hooks/useBulkTaskSelection';
import type { TaskFilters } from '@/features/task/types/TaskFilters';
import { EisenhowerQuadrant } from '@/legacy/components/EisenhowerQuadrant';
import { TaskSelectionToolbar } from '@/legacy/components/TaskSelectionToolbar';
import { useTasks } from '@/legacy/hooks/useTasks';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

export default function EisenhowerMatrixPage() {
  const updateTask = useBoardStore(s => s.updateTask);

  const [filters, setFilters] = useState<TaskFilters>(clearedFilters);
  const allTasks = useTasks(filters);

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

  const handleDrop =
    (importantVal: boolean, urgentVal: boolean) => async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!draggingId) return;
      const task = allTasks.find(x => x.id === draggingId);
      setDraggingId(null);
      if (!task || (task.important === importantVal && task.urgent === urgentVal)) {
        playInterfaceSound('snap');
        return;
      }
      playInterfaceSound('shift');
      await updateTask({
        id: draggingId,
        important: importantVal,
        urgent: urgentVal,
        updatedAt: new Date(),
      });
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
