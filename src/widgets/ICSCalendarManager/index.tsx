import { useEffect, useState } from 'react';

import { Circle as StatusIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

import { auth } from '@/services/firebase';
import {
  saveIcsCalendarsToFirestore,
  subscribeToIcsCalendars,
} from '@/services/firestore/icsCalendars';
import type { IcsCalendarConfig } from '@/types/IcsCalendarConfig';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

const STORAGE_KEY = 'ics-calendars';

function loadCalendars(): IcsCalendarConfig[] {
  try {
    const stored = getStoredFilters<IcsCalendarConfig[]>(STORAGE_KEY) ?? [];
    return stored;
  } catch (err) {
    console.error('Failed to load calendars', err);
    return [];
  }
}

function persistCalendars(calendars: IcsCalendarConfig[]) {
  const uid = auth.currentUser?.uid;
  if (uid) {
    saveIcsCalendarsToFirestore(uid, calendars).catch(err =>
      console.error('Failed to save calendars to Firestore', err),
    );
  }
  try {
    setStoredFilters(STORAGE_KEY, calendars);
  } catch (err) {
    console.error('Failed to save calendars', err);
  }
}

// Form state used for adding or editing a calendar
interface CalendarFormState {
  url: string;
  id: string;
  name: string;
  color: string;
}

export function ICSCalendarManager() {
  const [calendars, setCalendars] = useState<IcsCalendarConfig[]>([]);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CalendarFormState>({ url: '', id: '', name: '', color: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setCalendars(loadCalendars());

    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = subscribeToIcsCalendars(uid, list => {
      setCalendars(list);
      persistCalendars(list);
      queryClient.invalidateQueries({ queryKey: ['ics-events'] });
    });
    return () => unsub();
  }, [queryClient]);

  const handleChange =
    (field: keyof CalendarFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: event.target.value });
    };

  function resetForm() {
    setForm({ url: '', id: '', name: '', color: '' });
    setErrors({});
    setEditingIndex(null);
  }

  function validate(current: CalendarFormState): boolean {
    const newErrors: Record<string, string> = {};

    if (!current.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(current.url);
      } catch {
        newErrors.url = 'Invalid URL';
      }
    }

    if (!current.id.trim()) newErrors.id = 'ID is required';
    if (!current.name.trim()) newErrors.name = 'Name is required';

    if (!/^#?[0-9a-fA-F]{6}$/.test(current.color.trim())) {
      newErrors.color = 'Invalid hex color';
    }

    // duplicates
    const others = calendars.filter((_, i) => i !== editingIndex);
    if (others.some(c => c.id === current.id.trim())) newErrors.id = 'Duplicate ID';
    if (others.some(c => c.url === current.url.trim())) newErrors.url = 'Duplicate URL';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate(form)) return;

    if (editingIndex != null) {
      if (!window.confirm('Update this calendar configuration?')) return;
    }

    const normalized: IcsCalendarConfig = {
      url: form.url.trim(),
      id: form.id.trim(),
      name: form.name.trim(),
      color: form.color.replace(/^#/, '').toUpperCase(),
    };

    let updated: IcsCalendarConfig[];
    if (editingIndex != null) {
      updated = calendars.map((c, i) => (i === editingIndex ? normalized : c));
    } else {
      updated = [...calendars, normalized];
    }

    setCalendars(updated);
    persistCalendars(updated);
    queryClient.invalidateQueries({ queryKey: ['ics-events'] });
    resetForm();
  }

  function handleEdit(index: number) {
    const cal = calendars[index];
    setForm({
      url: cal.url,
      id: cal.id,
      name: cal.name,
      color: cal.color,
    });
    setEditingIndex(index);
  }

  function handleDelete(index: number) {
    const cal = calendars[index];
    if (!window.confirm(`Delete calendar "${cal.name}"?`)) return;

    const updated = calendars.filter((_, i) => i !== index);
    setCalendars(updated);
    persistCalendars(updated);
    queryClient.invalidateQueries({ queryKey: ['ics-events'] });
    if (editingIndex === index) resetForm();
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ICS Calendars
      </Typography>

      <List dense disablePadding>
        {calendars.map((cal, idx) => (
          <ListItem
            key={cal.id}
            sx={{
              pl: 0,
            }}
          >
            <ListItemIcon>
              <StatusIcon sx={{ color: `#${cal.color}` }} />
            </ListItemIcon>
            <ListItemText
              primary={cal.name}
              secondary={cal.url}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(idx)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {calendars.length === 0 && (
          <ListItem sx={{ pl: 0 }}>
            <ListItemText primary="No calendars" />
          </ListItem>
        )}
      </List>

      <Box component="form" sx={{ mt: 2 }} noValidate autoComplete="off">
        <Stack spacing={2}>
          <TextField
            label="ICS URL"
            value={form.url}
            onChange={handleChange('url')}
            error={Boolean(errors.url)}
            helperText={errors.url}
            fullWidth
          />
          <TextField
            label="Calendar ID"
            value={form.id}
            onChange={handleChange('id')}
            error={Boolean(errors.id)}
            helperText={errors.id}
            fullWidth
          />
          <TextField
            label="Calendar Name"
            value={form.name}
            onChange={handleChange('name')}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
          />
          <TextField
            label="Color"
            value={form.color}
            onChange={handleChange('color')}
            error={Boolean(errors.color)}
            helperText={errors.color || 'Hex color, e.g. #FFA836'}
            fullWidth
          />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={resetForm}>Clear</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingIndex != null ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default ICSCalendarManager;
