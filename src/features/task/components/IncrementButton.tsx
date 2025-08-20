import { useCallback, useEffect, useRef } from 'react';

import { AddCircleOutline as AddIcon } from '@mui/icons-material';

import { TaskActionButton } from '@/features/task/components/TaskActionButton';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

interface IncrementButtonProps {
  task: Task;
  dense?: boolean;
}

export function IncrementButton({ task, dense }: IncrementButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);

  // Freeze the initial quantity for this component instance
  const initialQuantityRef = useRef<number>(task.quantityDone);

  // If this component might be reused for a different task without unmounting,
  // reset the frozen value when the identity changes.
  useEffect(() => {
    initialQuantityRef.current = task.quantityDone;
  }, [task.id, task.quantityDone]);

  // Stable value for UI texts
  const newQuantityDone = initialQuantityRef.current + 1;

  const incrementQuantityDone = useCallback(async () => {
    // Use current store value to avoid stale updates
    await updateTask({
      ...task,
      quantityDone: task.quantityDone + 1,
      updatedAt: new Date(),
    });
  }, [task, updateTask]);

  return (
    <TaskActionButton
      icon={<AddIcon />}
      task={task}
      dense={dense}
      tooltip="Increment quantity done"
      onAction={incrementQuantityDone}
      successSound="increment"
      confirmTitle="Confirm increment"
      confirmContent={`Are you sure you want to increment the quantity done for ${task.title} to ${newQuantityDone}?`}
      successMessage={`${task.title} was incremented to ${newQuantityDone}`}
      errorMessage={`Failed to increment ${task.title}`}
      feedbackKey="increment-task"
    />
  );
}
