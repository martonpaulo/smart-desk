import { useSnackbar } from 'notistack';

import type { TaskSelectAction } from '@/features/task/types/TaskSelectAction';
import { useTaskSelection } from '@/legacy/hooks/useTaskSelection';
import { useBoardStore } from '@/legacy/store/board/store';
import type { Task } from '@/legacy/types/task';

/**
 * Describes the actions to apply in bulk
 */
export interface BulkTaskActions {
  important: TaskSelectAction;
  urgent: TaskSelectAction;
  blocked: TaskSelectAction;
  daily: TaskSelectAction;
  trashed: TaskSelectAction;
  done: TaskSelectAction;
  plannedDate: Date | null;
  estimatedTime: number | null;
  tagAction: TaskSelectAction;
  tagId: string | null;
}

/**
 * Encapsulates selection state and batch‑update handler
 */
export function useBulkTaskSelection(tasks: Task[]) {
  // base selection hooks
  const {
    isSelecting,
    selectedIds,
    selectedCount,
    selectTask,
    toggleSelecting,
    selectAll,
    selectNone,
    clearSelection,
  } = useTaskSelection();

  const totalCount = tasks.length;

  const { enqueueSnackbar } = useSnackbar();
  const updateTask = useBoardStore(s => s.updateTask);

  // select or clear all currently filtered tasks
  function handleSelectAll() {
    if (selectedCount !== totalCount) {
      selectAll(tasks.map(t => t.id));
    }
  }

  function handleDeselectAll() {
    if (selectedCount > 0) {
      selectNone();
    }
  }

  // exit selecting mode and clear selection
  function handleCancel() {
    toggleSelecting();
    clearSelection();
  }

  /**
   * Applies the given bulk actions to each selected task
   */
  async function handleApply(actions: BulkTaskActions) {
    const nowDate = new Date();

    const updates = Array.from(selectedIds).map(id => {
      const task = tasks.find(t => t.id === id)!;
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

      if (actions.done === 'set') change.quantityDone = task.quantityTarget;
      if (actions.done === 'clear') change.quantityDone = 0;

      change.plannedDate = actions.plannedDate ?? undefined;
      change.estimatedTime = actions.estimatedTime ?? undefined;

      if (actions.tagAction === 'set-tag') {
        change.tagId = actions.tagId || undefined;
      }
      if (actions.tagAction === 'clear') {
        change.tagId = undefined;
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
  }

  return {
    isSelecting,
    selectedIds,
    selectedCount,
    selectTask,
    toggleSelecting,
    handleSelectAll,
    handleDeselectAll,
    handleCancel,
    handleApply,
    totalCount,
  };
}
