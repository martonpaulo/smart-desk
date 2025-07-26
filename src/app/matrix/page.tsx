'use client';

import { useState } from 'react';

import {
  Alert,
  Button,
  FormControlLabel,
  FormGroup,
  Snackbar,
  Stack,
  Switch,
  useTheme,
} from '@mui/material';

import { EisenhowerQuadrant } from '@/components/EisenhowerQuadrant';
import { PageContentLayout } from '@/components/PageContentLayout';
import { TaskSelectionToolbar } from '@/components/TaskSelectionToolbar';
import { eisenhowerQuadrants } from '@/config/eisenhowerQuadrants';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSelection } from '@/hooks/useTaskSelection';
import { useBoardStore } from '@/store/board/store';
import type { Task } from '@/types/task';
import { playInterfaceSound } from '@/utils/soundPlayer';

export default function EisenhowerMatrixPage() {
  const updateTask = useBoardStore(s => s.updateTask);
  const tasks = useBoardStore(s => s.tasks);
  const { activeTasks } = useTasks();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showBlockedTasks, setShowBlockedTasks] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);
  const theme = useTheme();

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

      const task = tasks.find(t => t.id === draggingId);
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
    await Promise.all(
      Array.from(selectedIds).map(id => updateTask({ id, plannedDate: today, updatedAt: today })),
    );
    setUpdatedCount(count);
    setSnackbarOpen(true);
    clearSelection();
  };

  const handleClearDate = async () => {
    const now = new Date();
    const count = selectedIds.size;
    await Promise.all(
      Array.from(selectedIds).map(id => updateTask({ id, plannedDate: undefined, updatedAt: now })),
    );
    setUpdatedCount(count);
    setSnackbarOpen(true);
    clearSelection();
  };

  const handleMarkNone = async () => {
    const now = new Date();
    const count = selectedIds.size;
    await Promise.all(
      Array.from(selectedIds).map(id =>
        updateTask({ id, important: false, urgent: false, updatedAt: now }),
      ),
    );
    setUpdatedCount(count);
    setSnackbarOpen(true);
    clearSelection();
  };

  const handleSelectAll = () => {
    const visible = activeTasks.filter(t => showBlockedTasks || !t.blocked).map(t => t.id);
    selectAll(visible);
  };

  return (
    <PageContentLayout
      title="Eisenhower Matrix"
      description="Decide what matters, not just what screams for attention"
    >
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={showBlockedTasks}
              onChange={e => setShowBlockedTasks(e.target.checked)}
            />
          }
          label="Show Blocked Tasks"
          sx={{
            '& .MuiFormControlLabel-label': {
              ...theme.typography.body2,
            },
          }}
        />
      </FormGroup>

      <Stack direction="row" gap={2} mb={2}>
        <Button variant={isSelecting ? 'contained' : 'outlined'} onClick={toggleSelecting}>
          {isSelecting ? 'Cancel Selection' : 'Select Tasks'}
        </Button>
      </Stack>

      <Stack display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
        {eisenhowerQuadrants.map(
          ({ title, color, important, urgent, questions, examples, action }) => {
            const tasks = activeTasks.filter(
              t =>
                t.important === important &&
                t.urgent === urgent &&
                (showBlockedTasks || !t.blocked),
            );

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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {`Updated ${updatedCount} task${updatedCount !== 1 ? 's' : ''}`}
        </Alert>
      </Snackbar>
    </PageContentLayout>
  );
}
