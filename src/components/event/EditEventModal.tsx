import { useEffect, useRef, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { DateTime } from 'luxon';

import { Event } from '@/types/Event';

interface EditEventModalProps {
  open: boolean;
  event: Event | null;
  onSave: (event: Event) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function EditEventModal({ open, event, onSave, onDelete, onClose }: EditEventModalProps) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!event) return;
    setTitle(event.title);
    setStart(
      DateTime.fromJSDate(new Date(event.start)).toISO({ suppressMilliseconds: true }) || '',
    );
    setEnd(DateTime.fromJSDate(new Date(event.end)).toISO({ suppressMilliseconds: true }) || '');
  }, [event]);

  useEffect(() => {
    if (open && titleRef.current) {
      const input = titleRef.current;
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }, [open]);

  const handleSave = () => {
    if (!event) return;
    if (!title.trim() || !start || !end) {
      onClose();
      return;
    }
    onSave({
      ...event,
      title: title.trim(),
      start: new Date(start),
      end: new Date(end),
    });
    onClose();
  };

  const handleDelete = () => {
    if (event) onDelete(event.id);
    onClose();
  };

  const readOnly = !!event?.calendar;

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'escapeKeyDown') onClose();
        else handleSave();
      }}
      maxWidth="mobileSm"
      fullWidth
    >
      <DialogTitle sx={{ position: 'relative' }}>
        Edit Event
        {event && (
          <Tooltip title="Delete event">
            <IconButton
              aria-label="delete event"
              onClick={handleDelete}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            inputRef={titleRef}
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={readOnly}
            fullWidth
          />
          <TextField
            label="Start"
            type="datetime-local"
            value={start}
            onChange={e => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={readOnly}
            fullWidth
          />
          <TextField
            label="End"
            type="datetime-local"
            value={end}
            onChange={e => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={readOnly}
            fullWidth
          />
          {readOnly && (
            <Stack px={1} color="text.secondary">
              Remote events cannot be edited
            </Stack>
          )}
        </Stack>
      </DialogContent>

      {!readOnly && (
        <DialogActions>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
