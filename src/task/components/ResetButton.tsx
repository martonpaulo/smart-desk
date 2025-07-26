import { useCallback } from 'react';

import { Undo as UndoIcon } from '@mui/icons-material';

import { useDefaultColumns } from '@/hooks/useDefaultColumns';
import { useBoardStore } from '@/store/board/store';
import { TaskActionButton } from '@/task/components/TaskActionButton';
import { Task } from '@/types/task';

interface ResetButtonProps {
  task: Task;
}

export function ResetButton({ task }: ResetButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);
  const todoColumnPromise = useDefaultColumns('todo');

  const resetTask = useCallback(async () => {
    const todoColumn = await todoColumnPromise;

    await updateTask({
      ...task,
      quantityDone: 0,
      columnId: todoColumn?.id,
      updatedAt: new Date(),
    });
  }, [todoColumnPromise, task, updateTask]);

  return (
    <TaskActionButton
      icon={<UndoIcon />}
      tooltip="Reset quantity done"
      onAction={resetTask}
      soundName="reset"
      confirmTitle="Confirm reset"
      confirmContent={`Are you sure you want to reset the quantity done for <strong>${task.title}</strong>?`}
      successMessage={`${task.title} was reset successfully`}
      errorMessage={`Failed to reset ${task.title}`}
    />
  );
}
