import { useCallback } from 'react';

import { RemoveCircleOutline as UnblockIcon } from '@mui/icons-material';

import { TaskActionButton } from '@/features/task/components/TaskActionButton';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

interface UnblockButtonProps {
  task: Task;
}

export function UnblockButton({ task }: UnblockButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);

  const unblockTask = useCallback(async () => {
    await updateTask({ ...task, blocked: false, updatedAt: new Date() });
  }, [task, updateTask]);

  if (!task.blocked) {
    return null;
  }

  return (
    <TaskActionButton
      icon={<UnblockIcon />}
      tooltip="Unblock"
      onAction={unblockTask}
      soundName="unblock"
      confirmTitle="Unblock task"
      confirmContent={`Are you sure you want to unblock <strong>${task.title}</strong>?`}
      successMessage={`${task.title} was unblocked`}
      errorMessage={`Failed to unblock ${task.title}`}
    />
  );
}
