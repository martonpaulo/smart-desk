'use client';

import { PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDayItems } from '@/features/calendar/hooks/use-day-items';
import type { DayItem } from '@/features/calendar/types/day-item';
import { DATE_LOCALE_BY_LANGUAGE, toSupportedLanguage } from '@/features/i18n/constants/languages';
import { TaskForm } from '@/features/tasks/components/task-form';
import { useAuthUserId } from '@/features/tasks/hooks/use-auth-user-id';
import { useCreateTask, useDeleteTask, useUpdateTask } from '@/features/tasks/hooks/use-tasks';
import { getTodayDateValue } from '@/features/tasks/logic/task-date';
import type { TaskFormValues } from '@/features/tasks/logic/task-form-schema';
import { formatTaskTagsInput, parseTaskTagsInput } from '@/features/tasks/logic/task-tags';
import { cn } from '@/lib/utils';

const DEFAULT_CALENDAR_COLOR = '#9aa0a6';
const SKELETON_ROWS_COUNT = 2;
const LOCAL_PLANNED_SOURCE = 'task';

interface ItemSectionProps {
  title: string;
  emptyLabel: string;
  items: DayItem[];
  showTaskActions: boolean;
  canManageTasks: boolean;
  isUpdatePending: boolean;
  isDeletePending: boolean;
  onEditTask: (item: DayItem) => void;
  onDeleteTask: (taskId: string) => void;
}

function getCreateDefaultValues(): TaskFormValues {
  return {
    title: '',
    description: '',
    tagsInput: '',
    plannedDate: getTodayDateValue(),
  };
}

function mapItemToFormValues(item: DayItem): TaskFormValues {
  return {
    title: item.title,
    description: item.description ?? '',
    tagsInput: formatTaskTagsInput(item.tags),
    plannedDate: item.plannedDate ?? getTodayDateValue(),
  };
}

function getItemSignature(item: DayItem): string {
  return JSON.stringify({
    title: item.title,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    allDay: item.allDay,
    calendarColor: item.calendarColor,
    source: item.source,
    description: item.description,
    tags: item.tags,
    plannedDate: item.plannedDate,
  });
}

function getItemLabel(item: DayItem): string {
  return item.title.trim();
}

function formatTimeLabel(isoDate: string, locale: string): string {
  return new Date(isoDate).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ItemSection({
  title,
  emptyLabel,
  items,
  showTaskActions,
  canManageTasks,
  isUpdatePending,
  isDeletePending,
  onEditTask,
  onDeleteTask,
}: ItemSectionProps) {
  const { t, i18n } = useTranslation();
  const selectedLanguage = toSupportedLanguage(i18n.resolvedLanguage);
  const dateLocale = DATE_LOCALE_BY_LANGUAGE[selectedLanguage];

  return (
    <section className="space-y-2 rounded-lg">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null}
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map(item => (
            <li
              key={item.id}
              className={cn(
                'rounded-md border p-3',
                item.source === LOCAL_PLANNED_SOURCE && 'border-dashed',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden
                  className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.calendarColor ?? DEFAULT_CALENDAR_COLOR }}
                />
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {getItemLabel(item) || t('calendar.untitledItem')}
                    </p>
                    {item.allDay ? (
                      <p className="text-sm text-muted-foreground">{t('calendar.allDayLabel')}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {formatTimeLabel(item.startsAt, dateLocale)} -{' '}
                        {formatTimeLabel(item.endsAt, dateLocale)}
                      </p>
                    )}
                    {item.source === LOCAL_PLANNED_SOURCE && item.tags ? (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map(tagValue => (
                          <span
                            key={`${item.id}-${tagValue}`}
                            className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                          >
                            {tagValue}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.source === LOCAL_PLANNED_SOURCE && item.description ? (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    ) : null}
                  </div>

                  {showTaskActions && item.source === LOCAL_PLANNED_SOURCE ? (
                    <div className="flex gap-2">
                      <Button
                        aria-label={t('tasks.actions.edit')}
                        className="h-7 w-7"
                        disabled={!canManageTasks || isUpdatePending}
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          onEditTask(item);
                        }}
                      >
                        <PencilLineIcon aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label={t('tasks.actions.delete')}
                        disabled={!canManageTasks || isDeletePending}
                        size="icon-xs"
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          onDeleteTask(item.id);
                        }}
                      >
                        <Trash2Icon aria-hidden="true" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function DayItemsOverview() {
  const { t } = useTranslation();
  const { userId, isLoading: isAuthLoading } = useAuthUserId();
  const { data: items = [], isLoading, isFetched } = useDayItems();
  const createTaskMutation = useCreateTask(userId);
  const updateTaskMutation = useUpdateTask(userId);
  const deleteTaskMutation = useDeleteTask(userId);
  const previousItemsRef = useRef<Map<string, { signature: string; label: string }> | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DayItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<DayItem | null>(null);
  const createDefaultValues = getCreateDefaultValues();
  const canManageTasks = Boolean(userId) && !isAuthLoading;

  const { allDayItems, scheduledItems } = useMemo(() => {
    const groupedItems = {
      allDayItems: [] as DayItem[],
      scheduledItems: [] as DayItem[],
    };

    for (const item of items) {
      if (item.allDay) {
        groupedItems.allDayItems.push(item);
      } else {
        groupedItems.scheduledItems.push(item);
      }
    }

    return groupedItems;
  }, [items]);

  useEffect(() => {
    if (!isFetched) {
      return;
    }

    const currentItems = new Map(
      items.map(item => [
        item.id,
        { signature: getItemSignature(item), label: getItemLabel(item) },
      ]),
    );

    const previousItems = previousItemsRef.current;
    if (!previousItems) {
      previousItemsRef.current = currentItems;
      return;
    }

    for (const [itemId, currentItem] of currentItems) {
      const previousItem = previousItems.get(itemId);
      if (!previousItem) {
        toast.info(t('calendar.toasts.added', { label: currentItem.label }));
        continue;
      }

      if (previousItem.signature !== currentItem.signature) {
        toast.info(t('calendar.toasts.updated', { label: currentItem.label }));
      }
    }

    for (const [itemId, previousItem] of previousItems) {
      if (!currentItems.has(itemId)) {
        toast.info(t('calendar.toasts.removed', { label: previousItem.label }));
      }
    }

    previousItemsRef.current = currentItems;
  }, [isFetched, items, t]);

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
    if (!editingItem) {
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: editingItem.id,
        title: values.title,
        description: values.description ?? null,
        tags: parseTaskTagsInput(values.tagsInput),
        plannedDate: values.plannedDate,
      });
      toast.success(t('tasks.toasts.updated'));
      setEditingItem(null);
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
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
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

      {!canManageTasks ? (
        <p className="text-sm text-muted-foreground">{t('tasks.signInHint')}</p>
      ) : null}

      {isLoading ? (
        <ul className="space-y-2">
          {Array.from({ length: SKELETON_ROWS_COUNT }, (_, index) => (
            <li
              key={`item-skeleton-${index}`}
              aria-hidden
              className="rounded-md border p-3 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-muted" />
                <div className="w-full space-y-2">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {!isLoading ? (
        <>
          <ItemSection
            showTaskActions
            canManageTasks={canManageTasks}
            emptyLabel={t('calendar.emptyAllDay')}
            isDeletePending={deleteTaskMutation.isPending}
            isUpdatePending={updateTaskMutation.isPending}
            items={allDayItems}
            title={t('calendar.sectionAllDay')}
            onDeleteTask={taskId => {
              const selectedItem = allDayItems.find(item => item.id === taskId) ?? null;
              setItemPendingDelete(selectedItem);
            }}
            onEditTask={item => {
              setEditingItem(item);
            }}
          />
          <ItemSection
            canManageTasks={canManageTasks}
            emptyLabel={t('calendar.emptyScheduled')}
            isDeletePending={deleteTaskMutation.isPending}
            isUpdatePending={updateTaskMutation.isPending}
            items={scheduledItems}
            showTaskActions={false}
            title={t('calendar.sectionScheduled')}
            onDeleteTask={taskId => {
              const selectedItem = scheduledItems.find(item => item.id === taskId) ?? null;
              setItemPendingDelete(selectedItem);
            }}
            onEditTask={item => {
              setEditingItem(item);
            }}
          />
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('calendar.emptyStateHint')}</p>
          ) : null}
        </>
      ) : null}

      <Dialog
        open={Boolean(editingItem)}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setEditingItem(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tasks.editDialog.title')}</DialogTitle>
            <DialogDescription>{t('tasks.editDialog.description')}</DialogDescription>
          </DialogHeader>

          {editingItem ? (
            <TaskForm
              key={editingItem.id}
              showCancel
              defaultValues={mapItemToFormValues(editingItem)}
              idPrefix="edit-task"
              isSubmitting={updateTaskMutation.isPending}
              submitLabel={t('tasks.editDialog.saveChanges')}
              onCancel={() => {
                setEditingItem(null);
              }}
              onSubmit={handleUpdateTask}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(itemPendingDelete)}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setItemPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tasks.deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('tasks.deleteDialog.description', {
                title: itemPendingDelete?.title ?? t('tasks.defaultTaskTitle'),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setItemPendingDelete(null);
              }}
            >
              {t('tasks.editDialog.cancel')}
            </Button>
            <Button
              disabled={!itemPendingDelete || deleteTaskMutation.isPending}
              type="button"
              variant="destructive"
              onClick={() => {
                if (!itemPendingDelete) {
                  return;
                }

                void handleDeleteTask(itemPendingDelete.id).then(() => {
                  setItemPendingDelete(null);
                });
              }}
            >
              {t('tasks.deleteDialog.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
