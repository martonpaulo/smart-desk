'use client';

import { TaskModal } from '@/legacy/components/task/TaskModal';
import type { Task } from '@/legacy/types/task';

type PendingDropModalProps = {
  open: boolean;
  taskId?: string;
  important?: boolean;
  urgent?: boolean;
  tasks: Task[];
  onCloseAction: () => void;
  onSavedAction: (updated: Task) => void;
};

export function PendingDropModal({
  open,
  taskId,
  important,
  urgent,
  tasks,
  onCloseAction,
  onSavedAction,
}: PendingDropModalProps) {
  const task = tasks.find(t => t.id === taskId);

  return (
    <TaskModal
      open={open}
      task={task}
      newProperties={{
        important: !!important,
        urgent: !!urgent,
        plannedDate: new Date(),
      }}
      requiredFields={['title', 'estimatedTime']}
      onCloseAction={onCloseAction}
      onSaved={onSavedAction}
    />
  );
}
