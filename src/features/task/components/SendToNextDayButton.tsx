import { useCallback } from 'react';

import { SkipNext as SkipNextIcon } from '@mui/icons-material';

import { TaskActionButton } from '@/features/task/components/TaskActionButton';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

interface SendToNextDayButtonProps {
  task: Task;
}

export function SendToNextDayButton({ task }: SendToNextDayButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);

  const sendToNextDay = useCallback(async () => {
    const date = task.plannedDate ? new Date(task.plannedDate) : new Date();
    date.setDate(date.getDate() + 1);
    await updateTask({ ...task, plannedDate: date, updatedAt: new Date() });
  }, [task, updateTask]);

  return (
    <TaskActionButton
      icon={<SkipNextIcon />}
      tooltip="Send to next day"
      onAction={sendToNextDay}
      soundName="send"
      confirmTitle="Send task to next day"
      confirmContent={`Are you sure you want to send <strong>${task.title}</strong> to the next day?`}
      successMessage={`${task.title} was sent to next day`}
      errorMessage={`Failed to send ${task.title} to next day`}
    />
  );
}
