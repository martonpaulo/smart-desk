import { Check as CheckIcon } from '@mui/icons-material';
import { useCallback } from 'react';

import { TaskActionButton } from 'src/features/task/components/TaskActionButton';
import { useDefaultColumns } from 'src/legacy/hooks/useDefaultColumns';
import { useBoardStore } from 'src/legacy/store/board/store';
import { Task } from 'src/legacy/types/task';

interface MarkAsDoneButtonProps {
  task: Task;
  dense?: boolean;
}

export function MarkAsDoneButton({ task, dense }: MarkAsDoneButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);
  const doneColumnPromise = useDefaultColumns('done');

  const markAsDone = useCallback(async () => {
    const doneColumn = await doneColumnPromise;

    const now = new Date();

    await updateTask({
      ...task,
      quantityDone: task.quantityTarget,
      columnId: doneColumn?.id,
      plannedDate: now,
      classifiedDate: now,
      updatedAt: now,
    });
  }, [doneColumnPromise, task, updateTask]);

  return (
    <TaskActionButton
      icon={<CheckIcon />}
      task={task}
      dense={dense}
      tooltip="Mark as done"
      onAction={markAsDone}
      successSound="done"
      confirmTitle="Confirm completion"
      confirmContent={`Are you sure you want to mark <strong>${task.title}</strong> as done?`}
      successMessage={`${task.title} was marked as done`}
      errorMessage={`Failed to mark ${task.title} as done`}
      feedbackKey="mark-task-as-done"
    />
  );
}
