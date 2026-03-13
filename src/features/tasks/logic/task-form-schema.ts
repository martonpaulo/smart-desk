import type { TFunction } from 'i18next';
import { z } from 'zod';

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 500;
const TAGS_INPUT_MAX_LENGTH = 200;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function createTaskFormSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t('tasks.form.validation.titleRequired'))
      .max(TITLE_MAX_LENGTH, t('tasks.form.validation.titleMax', { max: TITLE_MAX_LENGTH })),
    description: z
      .string()
      .trim()
      .max(
        DESCRIPTION_MAX_LENGTH,
        t('tasks.form.validation.descriptionMax', { max: DESCRIPTION_MAX_LENGTH }),
      )
      .optional()
      .or(z.literal('')),
    tagsInput: z
      .string()
      .trim()
      .max(TAGS_INPUT_MAX_LENGTH, t('tasks.form.validation.tagsMax', { max: TAGS_INPUT_MAX_LENGTH }))
      .optional()
      .or(z.literal('')),
    plannedDate: z
      .string()
      .regex(ISO_DATE_PATTERN, t('tasks.form.validation.plannedDateFormat')),
  });
}

export type TaskFormValues = z.infer<ReturnType<typeof createTaskFormSchema>>;
