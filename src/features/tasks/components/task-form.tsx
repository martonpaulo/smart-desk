'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
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

  const submitTaskForm = form.handleSubmit(values => {
    void onSubmit(values);
  });

  return (
    <form
      noValidate
      aria-busy={isSubmitting}
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
          aria-describedby={form.formState.errors.title ? `${idPrefix}-title-error` : undefined}
          aria-invalid={Boolean(form.formState.errors.title)}
          disabled={disabled || isSubmitting}
          id={`${idPrefix}-title`}
          placeholder={t('tasks.form.titlePlaceholder')}
          {...form.register('title')}
        />
        {form.formState.errors.title ? (
          <p className="text-xs text-destructive" id={`${idPrefix}-title-error`} role="alert">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-description`}>
          {t('tasks.form.descriptionLabel')}
        </label>
        <Textarea
          aria-describedby={
            form.formState.errors.description ? `${idPrefix}-description-error` : undefined
          }
          aria-invalid={Boolean(form.formState.errors.description)}
          disabled={disabled || isSubmitting}
          id={`${idPrefix}-description`}
          placeholder={t('tasks.form.descriptionPlaceholder')}
          {...form.register('description')}
        />
        {form.formState.errors.description ? (
          <p className="text-xs text-destructive" id={`${idPrefix}-description-error`} role="alert">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor={`${idPrefix}-tags`}>
            {t('tasks.form.tagsLabel')}
          </label>
          <Input
            aria-describedby={
              form.formState.errors.tagsInput ? `${idPrefix}-tags-error` : undefined
            }
            aria-invalid={Boolean(form.formState.errors.tagsInput)}
            disabled={disabled || isSubmitting}
            id={`${idPrefix}-tags`}
            placeholder={t('tasks.form.tagsPlaceholder')}
            {...form.register('tagsInput')}
          />
          {form.formState.errors.tagsInput ? (
            <p className="text-xs text-destructive" id={`${idPrefix}-tags-error`} role="alert">
              {form.formState.errors.tagsInput.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor={`${idPrefix}-planned-date`}>
            {t('tasks.form.plannedDateLabel')}
          </label>
          <Input
            aria-describedby={
              form.formState.errors.plannedDate ? `${idPrefix}-planned-date-error` : undefined
            }
            aria-invalid={Boolean(form.formState.errors.plannedDate)}
            disabled={disabled || isSubmitting}
            id={`${idPrefix}-planned-date`}
            type="date"
            {...form.register('plannedDate')}
          />
          {form.formState.errors.plannedDate ? (
            <p
              className="text-xs text-destructive"
              id={`${idPrefix}-planned-date-error`}
              role="alert"
            >
              {form.formState.errors.plannedDate.message}
            </p>
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
