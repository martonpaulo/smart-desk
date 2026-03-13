import { z } from 'zod';

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 500;
const TAGS_INPUT_MAX_LENGTH = 200;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters.`),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX_LENGTH, `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`)
    .optional()
    .or(z.literal('')),
  tagsInput: z
    .string()
    .trim()
    .max(TAGS_INPUT_MAX_LENGTH, `Tags must be at most ${TAGS_INPUT_MAX_LENGTH} characters.`)
    .optional()
    .or(z.literal('')),
  plannedDate: z.string().regex(ISO_DATE_PATTERN, 'Planned date must be in YYYY-MM-DD format.'),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
