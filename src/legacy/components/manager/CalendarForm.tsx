'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { playInterfaceSound } from '@/features/sound/utils/soundPlayer';
import { IcsCalendar } from '@/legacy/types/icsCalendar';
import { ColorPicker } from '@/shared/components/ColorPicker';

interface CalendarFormProps {
  initial?: IcsCalendar;
  mode: 'add' | 'edit';
  onSubmit: (payload: { title: string; source: string; color: string }) => void;
  onCancel: () => void;
}

const schema = z.object({
  source: z.string().trim().min(1, 'URL is required').url('Must be a valid URL'),
  title: z.string().trim().min(1, 'Title is required'),
  color: z
    .string()
    .trim()
    .regex(/^#?[0-9A-Fa-f]{6}$/, 'Must be a 6-digit hex')
    .transform(v => (v.startsWith('#') ? v : `#${v}`)),
});

type FormValues = z.infer<typeof schema>;

/**
 * Zod + RHF with strong typing and clear errors.
 * No memo hooks needed thanks to the React compiler.
 */
export function CalendarForm({ initial, mode, onSubmit, onCancel }: CalendarFormProps) {
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      source: initial?.source ?? '',
      title: initial?.title ?? '',
      color: initial?.color ?? '#2196f3',
    },
  });

  useEffect(() => {
    reset({
      source: initial?.source ?? '',
      title: initial?.title ?? '',
      color: initial?.color ?? '#2196f3',
    });
  }, [initial, reset]);

  function submit(values: FormValues) {
    onSubmit(values);
    // parent shows success toast and sound for add/update
  }

  function onInvalid() {
    enqueueSnackbar('Please fix the form errors', { variant: 'error' });
    playInterfaceSound('error');
  }

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(submit, onInvalid)}
      sx={{ mt: 2 }}
    >
      <Stack spacing={2}>
        <Controller
          control={control}
          name="source"
          render={({ field }) => (
            <TextField
              {...field}
              label="ICS URL"
              placeholder="https://example.com/calendar.ics"
              error={Boolean(errors.source)}
              helperText={errors.source?.message}
              fullWidth
              inputProps={{ inputMode: 'url' }}
            />
          )}
        />

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              {...field}
              label="Calendar Name"
              placeholder="Personal Calendar"
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <ColorPicker
              value={field.value}
              onChange={v => {
                const next = typeof v === 'string' ? v : (v as unknown as string);
                field.onChange(next);
              }}
              label="Color"
              error={Boolean(errors.color)}
              helperText={errors.color?.message}
            />
          )}
        />

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            onClick={() => {
              onCancel();
            }}
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isSubmitting || !isDirty}>
            {mode === 'edit' ? 'Update' : 'Add'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
