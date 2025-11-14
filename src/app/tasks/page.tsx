'use client';

import { Button, Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import { PageSection } from 'src/core/components/PageSection';
import { TaskFilterPanel } from 'src/features/task/components/TaskFilterPanel';
import { clearedFilters } from 'src/features/task/constants/clearedFilters';
import { useBulkTaskSelection } from 'src/features/task/hooks/useBulkTaskSelection';
import type { TaskFilters } from 'src/features/task/types/TaskFilters';
import { TaskSelectionToolbar } from 'src/legacy/components/TaskSelectionToolbar';
import { useDefaultColumnObj } from 'src/legacy/hooks/useDefaultColumnObj';
import { useTasks } from 'src/legacy/hooks/useTasks';
import { customColors } from 'src/legacy/styles/colors';
import { useResponsiveness } from 'src/shared/hooks/useResponsiveness';

// Lazy loaded to keep initial bundle lean
const AddTaskFloatButton = dynamic(
  () => import('src/legacy/components/task/AddTaskFloatButton').then(m => m.AddTaskFloatButton),
  { ssr: false },
);

const AddTaskInput = dynamic(
  () => import('src/legacy/components/task/AddTaskInput').then(m => m.AddTaskInput),
  { ssr: false },
);

const TaskCard = dynamic(
  () => import('src/legacy/components/task/TaskCard').then(m => m.TaskCard),
  {
    ssr: false,
  },
);

export default function TasksPage() {
  const isMobile = useResponsiveness();
  const backlogColumn = useDefaultColumnObj('backlog');

  // Filters state
  const [filters, setFilters] = useState<TaskFilters>(clearedFilters);

  // Fetch filtered tasks
  const tasks = useTasks(filters);

  // Bulk-selection state and actions
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
  } = useBulkTaskSelection(tasks);

  // Track newly added task to auto‑open edit
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const count = tasks.length;
  const pageSubtitle = useMemo(() => {
    const base = `You have ${count} task${count !== 1 ? 's' : ''}`;
    return filters === clearedFilters ? base : `${base} matching the current filters`;
  }, [count, filters]);

  // Responsive card width
  const cardWidth = isMobile ? '100%' : '250px';

  return (
    <PageSection title="Tasks" description="Filter, scan, and act fast">
      {/* Subtitle */}
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
        {pageSubtitle}
      </Typography>

      {/* Filters */}
      <TaskFilterPanel filters={filters} onFilterChangeAction={setFilters} />

      {/* Selection toggle */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
        <Button
          variant={isSelecting ? 'contained' : 'outlined'}
          onClick={toggleSelecting}
          size={isMobile ? 'small' : 'medium'}
        >
          {isSelecting ? 'Cancel Selection' : 'Select Tasks'}
        </Button>
      </Stack>

      {/* Desktop quick-add inline. Mobile uses FAB below */}
      {!isMobile && (
        <AddTaskInput
          variant="outlined"
          columnProperties={backlogColumn}
          sx={{ width: cardWidth, mb: 1.5 }}
          onFinishAddingAction={newId => setEditingTaskId(newId)}
        />
      )}

      {/* Task list */}
      {tasks.length > 0 ? (
        <Stack direction="row" gap={1} flexWrap="wrap">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              color={customColors.blue.value}
              // Inline edit for just-created task
              editTask={editingTaskId === task.id}
              onFinishEditingAction={() => setEditingTaskId(null)}
              // Bulk selection
              selectable={isSelecting}
              selected={selectedIds.has(task.id)}
              onSelectChangeAction={selectTask}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No tasks found
        </Typography>
      )}

      {/* Mobile floating add */}
      {isMobile && <AddTaskFloatButton />}

      {/* Bulk selection toolbar */}
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
