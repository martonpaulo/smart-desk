import { useState } from 'react';

import type { TaskSelectAction } from '@/features/task/types/TaskSelectAction';

export interface BulkTaskActions {
  important: TaskSelectAction;
  urgent: TaskSelectAction;
  blocked: TaskSelectAction;
  daily: TaskSelectAction;
  trashed: TaskSelectAction;
  done: TaskSelectAction;
  classified: TaskSelectAction;
  plannedDate: Date | null;
  estimatedTime: number | null;
  tagAction: TaskSelectAction;
  tagId: string | null;
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
  const [classified, setClassified] = useState<TaskSelectAction>('none');
  const [tagAction, setTagAction] = useState<TaskSelectAction>('none');
  const [tagId, setTagId] = useState<string>('');
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [timeValue, setTimeValue] = useState<number | null>(null);

  const anyAction =
    important !== 'none' ||
    urgent !== 'none' ||
    blocked !== 'none' ||
    daily !== 'none' ||
    trashed !== 'none' ||
    done !== 'none' ||
    classified !== 'none' ||
    tagAction === 'select' ||
    dateValue !== null ||
    timeValue !== null;

  function resetForm(): void {
    setImportant('none');
    setUrgent('none');
    setBlocked('none');
    setDaily('none');
    setTrashed('none');
    setDone('none');
    setClassified('none');
    setTagAction('none');
    setTagId('');
    setDateValue(null);
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
      classified,
      plannedDate: dateValue ? new Date(dateValue) : null,
      estimatedTime: timeValue,
      tagAction,
      tagId: tagId || null,
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
    { label: 'Classified', state: classified, setter: setClassified },
  ] as const;

  return {
    modalOpen,
    controls,
    tagAction,
    setTagAction,
    tagId,
    setTagId,
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
