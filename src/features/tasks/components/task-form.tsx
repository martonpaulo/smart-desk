'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createTaskFormSchema, type TaskFormValues } from '@/features/tasks/logic/task-form-schema';

interface TaskFormProps {
  idPrefix?: string;
  defaultValues: TaskFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  disabled?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

export function TaskForm({
  idPrefix = 'task',
  defaultValues,
  submitLabel,
  isSubmitting,
  disabled = false,
  showCancel = false,
  onCancel,
  onSubmit,
}: TaskFormProps) {
  const { t } = useTranslation();
  const taskFormSchema = useMemo(() => createTaskFormSchema(t), [t]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const submitTaskForm = form.handleSubmit(values => {
    void onSubmit(values);
  });

  return (
    <form
      className="space-y-3"
      onSubmit={event => {
        void submitTaskForm(event);
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-title`}>
          {t('tasks.form.titleLabel')}
        </label>
        <Input
          disabled={disabled || isSubmitting}
          id={`${idPrefix}-title`}
          placeholder={t('tasks.form.titlePlaceholder')}
          {...form.register('title')}
        />
        {form.formState.errors.title ? (
          <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-description`}>
          {t('tasks.form.descriptionLabel')}
        </label>
        <Textarea
          disabled={disabled || isSubmitting}
          id={`${idPrefix}-description`}
          placeholder={t('tasks.form.descriptionPlaceholder')}
          {...form.register('description')}
        />
        {form.formState.errors.description ? (
          <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor={`${idPrefix}-tags`}>
            {t('tasks.form.tagsLabel')}
          </label>
          <Input
            disabled={disabled || isSubmitting}
            id={`${idPrefix}-tags`}
            placeholder={t('tasks.form.tagsPlaceholder')}
            {...form.register('tagsInput')}
          />
          {form.formState.errors.tagsInput ? (
            <p className="text-xs text-destructive">{form.formState.errors.tagsInput.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor={`${idPrefix}-planned-date`}>
            {t('tasks.form.plannedDateLabel')}
          </label>
          <Input
            disabled={disabled || isSubmitting}
            id={`${idPrefix}-planned-date`}
            type="date"
            {...form.register('plannedDate')}
          />
          {form.formState.errors.plannedDate ? (
            <p className="text-xs text-destructive">{form.formState.errors.plannedDate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button disabled={disabled || isSubmitting} type="submit">
          {submitLabel}
        </Button>
        {showCancel && onCancel ? (
          <Button disabled={isSubmitting} type="button" variant="outline" onClick={onCancel}>
            {t('tasks.editDialog.cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
