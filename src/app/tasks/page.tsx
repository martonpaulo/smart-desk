'use client';

import { useState } from 'react';

import { Button, Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

import { PageSection } from '@/core/components/PageSection';
import { TaskFilterPanel } from '@/features/task/components/TaskFilterPanel';
import { clearedFilters } from '@/features/task/constants/clearedFilters';
import { useBulkTaskSelection } from '@/features/task/hooks/useBulkTaskSelection';
import { TaskFilters } from '@/features/task/types/TaskFilters';
import { TaskSelectionToolbar } from '@/legacy/components/TaskSelectionToolbar';
import { useDefaultColumnObj } from '@/legacy/hooks/useDefaultColumnObj';
import { useTasks } from '@/legacy/hooks/useTasks';
import { customColors } from '@/legacy/styles/colors';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';
import { theme } from '@/theme';

// Lazy loaded components reduce the initial bundle size
const AddTaskFloatButton = dynamic(
  () => import('@/legacy/components/task/AddTaskFloatButton').then(m => m.AddTaskFloatButton),
  { ssr: false },
);

const AddTaskInput = dynamic(
  () => import('@/legacy/components/task/AddTaskInput').then(m => m.AddTaskInput),
  { ssr: false },
);

const TaskCard = dynamic(() => import('@/legacy/components/task/TaskCard').then(m => m.TaskCard), {
  ssr: false,
});

export default function TasksPage() {
  const backlogColumn = useDefaultColumnObj('backlog');
  const [filters, setFilters] = useState<TaskFilters>(clearedFilters);

  // fetch tasks (filtered by title)
  const tasks = useTasks(filters);

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

  // track screen size
  const isMobile = useResponsiveness();

  // track newly added task to auto‑open edit view
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // counts & dynamic titles/subtitles
  const count = tasks.length;

  const pageSubtitle = `You have a total of ${count} task${count !== 1 ? 's' : ''} that match${count !== 1 ? 'es' : ''} the current filters`;

  // width for each card
  const cardWidth = isMobile ? '100%' : '250px';

  return (
    <PageSection title="List of Tasks" hideDescription>
      <Typography variant="subtitle1" color={theme.palette.text.secondary}>
        {pageSubtitle}
      </Typography>

      <TaskFilterPanel filters={filters} onFilterChange={setFilters} />

      <Stack direction="row" mb={2}>
        <Button variant={isSelecting ? 'contained' : 'outlined'} onClick={toggleSelecting}>
          {isSelecting ? 'Cancel Selection' : 'Select Tasks'}
        </Button>
      </Stack>

      {!isMobile && (
        <AddTaskInput
          variant="outlined"
          columnProperties={backlogColumn}
          sx={{ width: cardWidth }}
          onFinishAdding={newId => setEditingTaskId(newId)}
        />
      )}

      {tasks.length > 0 ? (
        <Stack direction="row" gap={1} flexWrap="wrap">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              color={customColors.blue.value}
              width={cardWidth}
              editTask={editingTaskId === task.id}
              onFinishEditing={() => setEditingTaskId(null)}
              selectable={isSelecting}
              selected={selectedIds.has(task.id)}
              onSelectChange={selectTask}
            />
          ))}
        </Stack>
      ) : (
        <Typography>No tasks found</Typography>
      )}

      {/* on mobile, floating add button */}
      {isMobile && <AddTaskFloatButton />}

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
