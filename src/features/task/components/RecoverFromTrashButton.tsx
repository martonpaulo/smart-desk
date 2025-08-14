import { useCallback } from 'react';

import { RestoreFromTrash as RestoreFromTrashIcon } from '@mui/icons-material';

import { TaskActionButton } from '@/features/task/components/TaskActionButton';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

interface RecoverFromTrashButtonProps {
  task: Task;
}

export function RecoverFromTrashButton({ task }: RecoverFromTrashButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);

  const recoverTask = useCallback(async () => {
    await updateTask({
      ...task,
      trashed: false,
      updatedAt: new Date(),
    });
  }, [task, updateTask]);

  if (!task.trashed) return null;

  return (
    <TaskActionButton
      icon={<RestoreFromTrashIcon />}
      tooltip="Recover from trash"
      onAction={recoverTask}
      soundName="recover"
      confirmTitle="Recover task from trash"
      confirmContent={`<strong>${task.title}</strong> will be recovered from trash.`}
      successMessage={`${task.title} was recovered from trash`}
      errorMessage={`Failed to recover ${task.title}`}
    />
  );
}
