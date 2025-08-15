import { useCallback } from 'react';

import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import { addDays, isBefore, isSameDay, startOfDay } from 'date-fns';

import { TaskActionButton } from '@/features/task/components/TaskActionButton';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

interface SendToInboxButtonProps {
  task: Task;
}

export function SendToInboxButton({ task }: SendToInboxButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);

  const sendToInbox = useCallback(async () => {
    const today = startOfDay(new Date());

    let newPlannedDate: Date;

    if (!task.plannedDate) {
      // No date → set to tomorrow
      newPlannedDate = addDays(today, 1);
    } else {
      const planned = startOfDay(new Date(task.plannedDate));

      if (isSameDay(planned, today) || isBefore(planned, today)) {
        // Today or in the past → set to tomorrow
        newPlannedDate = addDays(today, 1);
      } else {
        // Future date → keep it
        newPlannedDate = planned;
      }
    }

    await updateTask({
      ...task,
      blocked: false,
      classifiedDate: today,
      plannedDate: newPlannedDate,
      updatedAt: today,
    });
  }, [task, updateTask]);

  return (
    <TaskActionButton
      icon={<ForwardToInboxIcon />}
      tooltip="Send to next inbox"
      onAction={sendToInbox}
      soundName="send"
      confirmTitle="Send task to next inbox"
      confirmContent={`Are you sure you want to send <strong>${task.title}</strong> to the next inbox?`}
      successMessage={`${task.title} was sent to next inbox`}
      errorMessage={`Failed to send ${task.title} to next inbox`}
    />
  );
}
