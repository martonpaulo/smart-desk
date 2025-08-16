'use client';

import { TaskModal } from '@/legacy/components/task/TaskModal';
import type { Task } from '@/legacy/types/task';

type EventConversionModalProps = {
  open: boolean;
  draft: Partial<Task> | null;
  onCloseAction: () => void;
  onSavedAction: (saved: Task) => void;
};

export function EventConversionModal({
  open,
  draft,
  onCloseAction,
  onSavedAction,
}: EventConversionModalProps) {
  // pass through required fields and defaults to TaskModal
  return (
    <TaskModal
      open={open}
      requiredFields={['title', 'plannedDate', 'estimatedTime']}
      newProperties={{
        ...draft,
      }}
      onCloseAction={onCloseAction}
      onSaved={onSavedAction}
    />
  );
}
