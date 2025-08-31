import { useCallback } from 'react';

import { RemoveCircleOutline as UnblockIcon } from '@mui/icons-material';

import { TaskActionButton } from '@/features/task/components/TaskActionButton';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

interface UnblockButtonProps {
  task: Task;
  dense?: boolean;
}

export function UnblockButton({ task, dense }: UnblockButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);

  const unblockTask = useCallback(async () => {
    await updateTask({ ...task, blocked: false, updatedAt: new Date() });
  }, [task, updateTask]);

  return (
    <TaskActionButton
      icon={<UnblockIcon />}
      task={task}
      dense={dense}
      tooltip="Unblock"
      onAction={unblockTask}
      successSound="unblock"
      confirmTitle="Unblock task"
      confirmContent={`Are you sure you want to unblock <strong>${task.title}</strong>?`}
      successMessage={`${task.title} was unblocked`}
      errorMessage={`Failed to unblock ${task.title}`}
      feedbackKey="unblock-task"
    />
  );
}
