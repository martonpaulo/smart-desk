'use client';

import { PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DATE_LOCALE_BY_LANGUAGE, toSupportedLanguage } from '@/features/i18n/constants/languages';
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
import { formatTaskTagsInput, parseTaskTagsInput } from '@/features/tasks/logic/task-tags';
import type { Task } from '@/features/tasks/types/task';

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

function formatPlannedDateLabel(plannedDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${plannedDate}T00:00:00`));
}

export function TasksOverview() {
  const { t, i18n } = useTranslation();
  const { userId, isLoading: isAuthLoading } = useAuthUserId();
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks();
  const selectedLanguage = toSupportedLanguage(i18n.resolvedLanguage);
  const dateLocale = DATE_LOCALE_BY_LANGUAGE[selectedLanguage];

  const createTaskMutation = useCreateTask(userId);
  const updateTaskMutation = useUpdateTask(userId);
  const deleteTaskMutation = useDeleteTask(userId);

  const [createFormKey, setCreateFormKey] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
      toast.success(t('tasks.toasts.created'));
      setCreateFormKey(previousKey => previousKey + 1);
    } catch {
      toast.error(t('tasks.toasts.createError'));
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
      toast.success(t('tasks.toasts.updated'));
      setEditingTask(null);
    } catch {
      toast.error(t('tasks.toasts.updateError'));
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast.success(t('tasks.toasts.deleted'));
    } catch {
      toast.error(t('tasks.toasts.deleteError'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{t('tasks.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('tasks.subtitle')}</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canManageTasks} size="sm" type="button">
                {t('tasks.form.addTask')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('tasks.createDialog.title')}</DialogTitle>
                <DialogDescription>{t('tasks.createDialog.description')}</DialogDescription>
              </DialogHeader>

              {isCreateDialogOpen ? (
                <TaskForm
                  key={createFormKey}
                  showCancel
                  defaultValues={createDefaultValues}
                  idPrefix="create-task"
                  isSubmitting={createTaskMutation.isPending}
                  submitLabel={t('tasks.form.addTask')}
                  onCancel={() => {
                    setIsCreateDialogOpen(false);
                  }}
                  onSubmit={async values => {
                    await handleCreateTask(values);
                    setIsCreateDialogOpen(false);
                  }}
                />
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canManageTasks ? (
          <p className="text-sm text-muted-foreground">{t('tasks.signInHint')}</p>
        ) : null}

        {isTasksLoading ? (
          <p className="text-sm text-muted-foreground">{t('tasks.loading')}</p>
        ) : null}

        {!isTasksLoading && tasks.length === 0 ? (
          <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            {t('tasks.emptyState')}
          </p>
        ) : null}

        {!isTasksLoading && tasks.length > 0 ? (
          <ul className="space-y-2">
            {tasks.map(task => (
              <li key={task.id} className="rounded-md border p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{task.title || t('tasks.defaultTaskTitle')}</p>
                      <Button
                        aria-label={t('tasks.actions.edit')}
                        className="h-6 w-6"
                        disabled={!canManageTasks || updateTaskMutation.isPending}
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingTask(task);
                        }}
                      >
                        <PencilLineIcon aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {task.tags?.map(tagValue => (
                        <span
                          key={`${task.id}-${tagValue}`}
                          className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground"
                        >
                          {tagValue}
                        </span>
                      ))}
                      <span>{formatPlannedDateLabel(task.plannedDate, dateLocale)}</span>
                    </div>
                    {task.description ? (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      aria-label={t('tasks.actions.delete')}
                      disabled={!canManageTasks || deleteTaskMutation.isPending}
                      size="sm"
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        void handleDeleteTask(task.id);
                      }}
                    >
                      <Trash2Icon aria-hidden="true" />
                      {t('tasks.actions.delete')}
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
            <DialogTitle>{t('tasks.editDialog.title')}</DialogTitle>
            <DialogDescription>{t('tasks.editDialog.description')}</DialogDescription>
          </DialogHeader>

          {editingTask ? (
            <TaskForm
              key={editingTask.id}
              showCancel
              defaultValues={mapTaskToFormValues(editingTask)}
              idPrefix="edit-task"
              isSubmitting={updateTaskMutation.isPending}
              submitLabel={t('tasks.editDialog.saveChanges')}
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
