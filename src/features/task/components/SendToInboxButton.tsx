import { useCallback } from 'react';

import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import { addDays, isBefore, startOfDay } from 'date-fns';

import { TaskActionButton } from '@/features/task/components/TaskActionButton';
import { useBoardStore } from '@/legacy/store/board/store';
import { Task } from '@/legacy/types/task';

interface SendToInboxButtonProps {
  task: Task;
}

export function SendToInboxButton({ task }: SendToInboxButtonProps) {
  const updateTask = useBoardStore(s => s.updateTask);

  const sendToInbox = useCallback(async () => {
    const tomorrow = startOfDay(addDays(new Date(), 1));

    // Decide plannedDate for the next inbox
    const newPlannedDate =
      !task.plannedDate || isBefore(task.plannedDate, tomorrow) ? tomorrow : task.plannedDate;

    await updateTask({
      ...task,
      blocked: false,
      classifiedDate: new Date(),
      plannedDate: newPlannedDate,
      updatedAt: new Date(),
    });
  }, [task, updateTask]);

  return (
    <TaskActionButton
      icon={<ForwardToInboxIcon />}
      task={task}
      tooltip="Send to next inbox"
      onAction={sendToInbox}
      successSound="send"
      confirmTitle="Send task to next inbox"
      confirmContent={`Are you sure you want to send <strong>${task.title}</strong> to the next inbox?`}
      successMessage={`${task.title} was sent to next inbox`}
      errorMessage={`Failed to send ${task.title} to next inbox`}
      feedbackKey="send-task-to-inbox"
    />
  );
}
