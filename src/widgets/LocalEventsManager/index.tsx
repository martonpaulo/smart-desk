import { useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';

import { useEventStore } from '@/store/eventStore';
import { showUndo } from '@/store/undoStore';
import type { IEvent } from '@/types/IEvent';

interface FormState {
  id?: string;
  title: string;
  start: string;
  end: string;
}

export function LocalEventsManager() {
  const events = useEventStore(state => state.localEvents);
  const addEvent = useEventStore(state => state.addLocalEvent);
  const updateEvent = useEventStore(state => state.updateLocalEvent);
  const deleteEvent = useEventStore(state => state.deleteEvent);

  const nowIso = DateTime.now().toISO({ suppressMilliseconds: true });
  const [form, setForm] = useState<FormState>({
    title: '',
    start: nowIso ?? '',
    end: DateTime.now().plus({ hours: 1 }).toISO({ suppressMilliseconds: true }) ?? '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setForm({
      title: '',
      start: DateTime.now().toISO({ suppressMilliseconds: true }) ?? '',
      end: DateTime.now().plus({ hours: 1 }).toISO({ suppressMilliseconds: true }) ?? '',
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.start || !form.end) return;
    const event: IEvent = {
      id: editingId ?? `local-${Date.now()}`,
      title: form.title.trim(),
      start: new Date(form.start),
      end: new Date(form.end),
    };
    if (editingId) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
    resetForm();
  };

  const handleEdit = (ev: IEvent) => {
    setForm({
      id: ev.id,
      title: ev.title,
      start: DateTime.fromJSDate(ev.start).toISO({ suppressMilliseconds: true }) ?? '',
      end: DateTime.fromJSDate(ev.end).toISO({ suppressMilliseconds: true }) ?? '',
    });
    setEditingId(ev.id);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Local Events
      </Typography>
      <List dense>
        {events.map(ev => (
          <ListItem key={ev.id} sx={{ pl: 0, position: 'relative' }}>
            <ListItemText
              primary={ev.title}
              secondary={`${ev.start.toLocaleString()} – ${ev.end.toLocaleString()}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(ev)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                className="delete-btn"
                edge="end"
                aria-label="delete"
                onClick={() => {
                  deleteEvent(ev.id);
                  showUndo('Event deleted', () => useEventStore.getState().restoreEvent(ev.id));
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {events.length === 0 && (
          <ListItem sx={{ pl: 0 }}>
            <ListItemText primary="No local events" />
          </ListItem>
        )}
      </List>

      <Stack spacing={2} mt={2}>
        <TextField
          label="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          fullWidth
        />
        <TextField
          label="Start"
          type="datetime-local"
          value={form.start}
          onChange={e => setForm({ ...form, start: e.target.value })}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="End"
          type="datetime-local"
          value={form.end}
          onChange={e => setForm({ ...form, end: e.target.value })}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button variant="contained" onClick={handleSubmit}>
          {editingId ? 'Update' : 'Add'} Event
        </Button>
      </Stack>

      {/* Trash moved to settings */}
    </Box>
  );
}
