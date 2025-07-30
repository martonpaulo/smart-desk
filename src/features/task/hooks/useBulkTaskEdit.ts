import { useState } from 'react';

import type { TaskSelectAction } from '@/features/task/types/TaskSelectAction';

export interface BulkTaskActions {
  important: TaskSelectAction;
  urgent: TaskSelectAction;
  blocked: TaskSelectAction;
  daily: TaskSelectAction;
  trashed: TaskSelectAction;
  done: TaskSelectAction;
  plannedDate: Date | null;
  estimatedTime: number | null;
}

/**
 * Manages all state and handlers for the "Bulk Edit Tasks" modal
 */
export function useBulkTaskEdit(onApply: (actions: BulkTaskActions) => void) {
  const [modalOpen, setModalOpen] = useState(false);
  const [important, setImportant] = useState<TaskSelectAction>('none');
  const [urgent, setUrgent] = useState<TaskSelectAction>('none');
  const [blocked, setBlocked] = useState<TaskSelectAction>('none');
  const [daily, setDaily] = useState<TaskSelectAction>('none');
  const [trashed, setTrashed] = useState<TaskSelectAction>('none');
  const [done, setDone] = useState<TaskSelectAction>('none');
  const [dateValue, setDateValue] = useState<string>('');
  const [timeValue, setTimeValue] = useState<number | null>(null);

  const anyAction =
    important !== 'none' ||
    urgent !== 'none' ||
    blocked !== 'none' ||
    daily !== 'none' ||
    trashed !== 'none' ||
    done !== 'none' ||
    dateValue !== '' ||
    timeValue !== null;

  function resetForm(): void {
    setImportant('none');
    setUrgent('none');
    setBlocked('none');
    setDaily('none');
    setTrashed('none');
    setDone('none');
    setDateValue('');
    setTimeValue(null);
  }

  function openModal(): void {
    resetForm();
    setModalOpen(true);
  }

  function closeModal(): void {
    resetForm();
    setModalOpen(false);
  }

  function applyChanges(): void {
    onApply({
      important,
      urgent,
      blocked,
      daily,
      trashed,
      done,
      plannedDate: dateValue ? new Date(dateValue) : null,
      estimatedTime: timeValue,
    });
    closeModal();
  }

  // expose an array of tri‑state controls for easier mapping
  const controls = [
    { label: 'Important', state: important, setter: setImportant },
    { label: 'Urgent', state: urgent, setter: setUrgent },
    { label: 'Blocked', state: blocked, setter: setBlocked },
    { label: 'Daily', state: daily, setter: setDaily },
    { label: 'Trashed', state: trashed, setter: setTrashed },
    { label: 'Done', state: done, setter: setDone },
  ] as const;

  return {
    modalOpen,
    controls,
    dateValue,
    setDateValue,
    timeValue,
    setTimeValue,
    anyAction,
    openModal,
    closeModal,
    applyChanges,
  };
}
