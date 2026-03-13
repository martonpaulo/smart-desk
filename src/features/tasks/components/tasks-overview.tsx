'use client';

import { PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm } from '@/features/tasks/components/task-form';
import { useAuthUserId } from '@/features/tasks/hooks/use-auth-user-id';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/features/tasks/hooks/use-tasks';
import { getTodayDateValue } from '@/features/tasks/logic/task-date';
import type { TaskFormValues } from '@/features/tasks/logic/task-form-schema';
import {
  formatTaskTagsInput,
  parseTaskTagsInput,
} from '@/features/tasks/logic/task-tags';
import type { Task } from '@/features/tasks/types/task';

const DEFAULT_TASK_TITLE = 'New Task';
const TASK_CREATED_MESSAGE = 'Task created.';
const TASK_UPDATED_MESSAGE = 'Task updated.';
const TASK_DELETED_MESSAGE = 'Task deleted.';
const TASK_CREATE_ERROR_MESSAGE = 'Could not create task. Try again.';
const TASK_UPDATE_ERROR_MESSAGE = 'Could not update task. Try again.';
const TASK_DELETE_ERROR_MESSAGE = 'Could not delete task. Try again.';
const TASK_EMPTY_STATE_MESSAGE =
  'No tasks yet. Create one and it will also appear as an all-day event.';
const TASK_SIGN_IN_HINT = 'Sign in to create and sync tasks.';
const DATE_FORMAT_LOCALE = 'en-US';

function getCreateDefaultValues(): TaskFormValues {
  return {
    title: '',
    description: '',
    tagsInput: '',
    plannedDate: getTodayDateValue(),
  };
}

function mapTaskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    tagsInput: formatTaskTagsInput(task.tags),
    plannedDate: task.plannedDate,
  };
}

function formatPlannedDateLabel(plannedDate: string): string {
  return new Intl.DateTimeFormat(DATE_FORMAT_LOCALE, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${plannedDate}T00:00:00`));
}

export function TasksOverview() {
  const { userId, isLoading: isAuthLoading } = useAuthUserId();
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks();

  const createTaskMutation = useCreateTask(userId);
  const updateTaskMutation = useUpdateTask(userId);
  const deleteTaskMutation = useDeleteTask(userId);

  const [createFormKey, setCreateFormKey] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const createDefaultValues = getCreateDefaultValues();

  const canManageTasks = Boolean(userId) && !isAuthLoading;

  const handleCreateTask = async (values: TaskFormValues): Promise<void> => {
    try {
      await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description ?? null,
        tags: parseTaskTagsInput(values.tagsInput),
        plannedDate: values.plannedDate,
      });
      toast.success(TASK_CREATED_MESSAGE);
      setCreateFormKey(previousKey => previousKey + 1);
    } catch {
      toast.error(TASK_CREATE_ERROR_MESSAGE);
    }
  };

  const handleUpdateTask = async (values: TaskFormValues): Promise<void> => {
    if (!editingTask) {
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        title: values.title,
        description: values.description ?? null,
        tags: parseTaskTagsInput(values.tagsInput),
        plannedDate: values.plannedDate,
      });
      toast.success(TASK_UPDATED_MESSAGE);
      setEditingTask(null);
    } catch {
      toast.error(TASK_UPDATE_ERROR_MESSAGE);
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast.success(TASK_DELETED_MESSAGE);
    } catch {
      toast.error(TASK_DELETE_ERROR_MESSAGE);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create tasks with a planned date. They are shown as all-day items on that day.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <TaskForm
          key={createFormKey}
          defaultValues={createDefaultValues}
          disabled={!canManageTasks}
          idPrefix="create-task"
          isSubmitting={createTaskMutation.isPending}
          submitLabel="Add task"
          onSubmit={handleCreateTask}
        />

        {!canManageTasks ? <p className="text-sm text-muted-foreground">{TASK_SIGN_IN_HINT}</p> : null}

        {isTasksLoading ? <p className="text-sm text-muted-foreground">Loading tasks...</p> : null}

        {!isTasksLoading && tasks.length === 0 ? (
          <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            {TASK_EMPTY_STATE_MESSAGE}
          </p>
        ) : null}

        {!isTasksLoading && tasks.length > 0 ? (
          <ul className="space-y-2">
            {tasks.map(task => (
              <li key={task.id} className="rounded-md border p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{task.title || DEFAULT_TASK_TITLE}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {task.tags?.map(tagValue => (
                        <span
                          key={`${task.id}-${tagValue}`}
                          className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground"
                        >
                          {tagValue}
                        </span>
                      ))}
                      <span>{formatPlannedDateLabel(task.plannedDate)}</span>
                    </div>
                    {task.description ? (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      aria-label="Edit task"
                      disabled={!canManageTasks || updateTaskMutation.isPending}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTask(task);
                      }}
                    >
                      <PencilLineIcon />
                      Edit
                    </Button>
                    <Button
                      aria-label="Delete task"
                      disabled={!canManageTasks || deleteTaskMutation.isPending}
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        void handleDeleteTask(task.id);
                      }}
                    >
                      <Trash2Icon />
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>

      <Dialog
        open={Boolean(editingTask)}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setEditingTask(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>
              Update the title, optional notes, optional tags, and planned date.
            </DialogDescription>
          </DialogHeader>

          {editingTask ? (
            <TaskForm
              showCancel
              defaultValues={mapTaskToFormValues(editingTask)}
              idPrefix="edit-task"
              isSubmitting={updateTaskMutation.isPending}
              submitLabel="Save changes"
              onCancel={() => {
                setEditingTask(null);
              }}
              onSubmit={handleUpdateTask}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
