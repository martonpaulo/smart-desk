import { useCallback } from 'react';

import { AddCircleOutline as AddIcon } from '@mui/icons-material';

import { TaskActionButton } from '@/features/task/components/TaskActionButton';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

interface IncrementButtonProps {
  task: Task;
}

export function IncrementButton({ task }: IncrementButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);

  const newQuantityDone = task.quantityDone + 1;

  const incrementQuantityDone = useCallback(async () => {
    await updateTask({
      ...task,
      quantityDone: newQuantityDone,
      updatedAt: new Date(),
    });
  }, [task, newQuantityDone, updateTask]);

  if (newQuantityDone >= task.quantityTarget) {
    return null;
  }

  return (
    <TaskActionButton
      icon={<AddIcon />}
      tooltip="Increment quantity done"
      onAction={incrementQuantityDone}
      soundName="increment"
      confirmTitle="Confirm increment"
      confirmContent={`Are you sure you want to increment the quantity done for ${task.title} to ${newQuantityDone}?`}
      successMessage={`${task.title} was incremented to ${newQuantityDone}`}
      errorMessage={`Failed to increment ${task.title}`}
    />
  );
}
