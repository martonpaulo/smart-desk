import { ChangeEvent, useEffect, useState } from 'react';

import { Box, Button, Stack, TextField } from '@mui/material';

import { IcsCalendar } from '@/types/icsCalendar';

interface CalendarFormProps {
  initial?: IcsCalendar;
  mode: 'add' | 'edit';
  onSubmit: (title: string, source: string, color: string) => void;
  onCancel: () => void;
}

export function CalendarForm({ initial, mode, onSubmit, onCancel }: CalendarFormProps) {
  const [form, setForm] = useState<Partial<IcsCalendar>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // populate when editing
  useEffect(() => {
    if (initial) {
      setForm(initial);
    } else {
      setForm({ source: '', title: '', color: '' });
    }
    setErrors({});
  }, [initial]);

  const handleChange = (field: keyof IcsCalendar) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  // basic validations
  const validate = () => {
    const errs: Record<string, string> = {};
    const url = (form.source ?? '').trim();
    if (!url) {
      errs.url = 'URL is required';
    } else {
      try {
        new URL(url);
      } catch {
        errs.url = 'Invalid URL';
      }
    }

    const title = (form.title ?? '').trim();
    if (!title) errs.title = 'Title is required';

    const color = (form.color ?? '').trim();
    if (!/^#?[0-9A-Fa-f]{6}$/.test(color)) {
      errs.color = 'Invalid hex color';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form.title!, form.source!, form.color!);
  };

  return (
    <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
      <Stack spacing={2}>
        <TextField
          label="ICS URL"
          value={form.source || ''}
          onChange={handleChange('source')}
          error={Boolean(errors.url)}
          helperText={errors.url}
          fullWidth
        />
        <TextField
          label="Calendar Name"
          value={form.title || ''}
          onChange={handleChange('title')}
          error={Boolean(errors.name)}
          helperText={errors.name}
          fullWidth
        />
        <TextField
          label="Color"
          value={form.color || ''}
          onChange={handleChange('color')}
          error={Boolean(errors.color)}
          helperText={errors.color || 'Hex color, e.g. #FFA836'}
          fullWidth
        />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {mode === 'edit' ? 'Update' : 'Add'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
