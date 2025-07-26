import { useCallback } from 'react';

import { Check as CheckIcon } from '@mui/icons-material';

import { useDefaultColumns } from '@/hooks/useDefaultColumns';
import { useBoardStore } from '@/store/board/store';
import { TaskActionButton } from '@/task/components/TaskActionButton';
import { Task } from '@/types/task';

interface MarkAsDoneButtonProps {
  task: Task;
}

export function MarkAsDoneButton({ task }: MarkAsDoneButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);
  const doneColumnPromise = useDefaultColumns('done');

  const markAsDone = useCallback(async () => {
    const doneColumn = await doneColumnPromise;

    await updateTask({
      ...task,
      quantityDone: task.quantityTarget,
      columnId: doneColumn?.id,
      updatedAt: new Date(),
    });
  }, [doneColumnPromise, task, updateTask]);

  if (task.quantityDone + 1 !== task.quantityTarget) {
    return null;
  }

  return (
    <TaskActionButton
      icon={<CheckIcon />}
      tooltip="Mark as done"
      onAction={markAsDone}
      soundName="done"
      confirmTitle="Confirm completion"
      confirmContent={`Are you sure you want to mark <strong>${task.title}</strong> as done?`}
      successMessage={`${task.title} was marked as done`}
      errorMessage={`Failed to mark ${task.title} as done`}
    />
  );
}
