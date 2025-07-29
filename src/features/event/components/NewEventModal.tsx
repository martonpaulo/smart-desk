import { useCallback, useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
} from '@mui/material';
import { DateTime } from 'luxon';

import { useLocalEventsStore } from '@/features/event/store/LocalEventsStore';
import { Event } from '@/features/event/types/Event';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';

// helper to build a JS Date from separate date and time strings
function combineDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
}

export function NewEventModal({ isOpen, onClose, event }: NewEventModalProps) {
  const addLocalEvent = useLocalEventsStore(s => s.add);
  const updateEvent = useLocalEventsStore(s => s.update);
  const deleteEvent = useLocalEventsStore(s => s.softDelete);

  // form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [manualAllDay, setManualAllDay] = useState(false);
  const [isEndModified, setIsEndModified] = useState(false);

  // reset defaults when opening or event changes
  useEffect(() => {
    if (!isOpen) return;

    if (event) {
      const s = DateTime.fromJSDate(new Date(event.startTime));
      const e = DateTime.fromJSDate(new Date(event.endTime));

      setTitle(event.summary);
      setDescription(event.description || '');
      setStartDate(s.toISODate() ?? '');
      setStartTime(s.toFormat('HH:mm'));
      setEndDate(e.toISODate() ?? '');
      setEndTime(e.toFormat('HH:mm'));
      setIsAllDay(event.allDay);
      setManualAllDay(true);
      setIsEndModified(true);
    } else {
      const now = DateTime.now();
      const d = now.toISODate();
      const roundTime = now.plus({ minutes: 60 - now.minute });
      const t = roundTime.startOf('minute').toFormat('HH:mm');
      const next = roundTime.plus({ hours: 1 });

      setTitle('');
      setDescription('');
      setStartDate(d);
      setStartTime(t);
      setEndDate(d);
      setEndTime(next.toFormat('HH:mm'));
      setIsAllDay(false);
      setManualAllDay(false);
      setIsEndModified(false);
    }
  }, [isOpen, event]);

  // if end never touched, keep it = start +1h
  useEffect(() => {
    if (isEndModified) return;
    if (!startDate || !startTime) return;
    const s = DateTime.fromISO(`${startDate}T${startTime}`);
    const e = s.plus({ hours: 1 });
    setEndDate(e.toISODate() ?? '');
    setEndTime(e.toFormat('HH:mm'));
  }, [startDate, startTime, isEndModified]);

  // auto toggle all-day if span ≥ 24h unless user chose
  useEffect(() => {
    if (manualAllDay) return;
    if (!startDate || !startTime || !endDate || !endTime) return;
    const s = DateTime.fromISO(`${startDate}T${startTime}`);
    const e = DateTime.fromISO(`${endDate}T${endTime}`);
    setIsAllDay(e.diff(s, 'hours').hours >= 24);
  }, [startDate, startTime, endDate, endTime, manualAllDay]);

  // build event and save
  const handleSave = useCallback(async () => {
    if (!title.trim() || !startDate || !startTime) return;

    let s = combineDateTime(startDate, startTime);
    let e =
      endDate && endTime
        ? combineDateTime(endDate, endTime)
        : new Date(s.getTime() + 60 * 60 * 1000);

    // ensure end > start
    if (e <= s) {
      e = new Date(s.getTime() + 60 * 60 * 1000);
    }

    // full‐day span
    if (isAllDay) {
      s = new Date(s.setHours(0, 0, 0, 0));
      e = new Date(e.setHours(23, 59, 59, 999));
    }

    if (event) {
      await updateEvent({
        id: event.id,
        summary: title.trim(),
        description: description.trim() || undefined,
        startTime: s,
        endTime: e,
        allDay: isAllDay,
        updatedAt: new Date(),
      });
    } else {
      await addLocalEvent({
        summary: title.trim(),
        description: description.trim() || undefined,
        startTime: s,
        endTime: e,
        allDay: isAllDay,
        createdAt: new Date(),
      });
    }

    onClose();
  }, [
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    isAllDay,
    addLocalEvent,
    updateEvent,
    event,
    onClose,
  ]);

  // clicking outside saves, escape just closes
  const handleDialogClose = useCallback(
    (_: unknown, reason: string) => {
      if (reason === 'backdropClick') {
        handleSave();
      } else if (reason === 'escapeKeyDown') {
        onClose();
      }
    },
    [handleSave, onClose],
  );

  const handleDelete = async () => {
    if (!event) return;
    await deleteEvent(event.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleDialogClose} fullWidth maxWidth="mobileLg">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {event ? 'Edit Event' : 'Create New Event'}
          {event?.id && (
            <IconButton aria-label="delete event" color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            required
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isAllDay}
                onChange={(_, checked) => {
                  setIsAllDay(checked);
                  setManualAllDay(true);
                }}
              />
            }
            label="This is an all-day event"
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Start date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Start time"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              fullWidth
              required
              disabled={isAllDay}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="End date"
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setIsEndModified(true);
              }}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End time"
              type="time"
              value={endTime}
              onChange={e => {
                setEndTime(e.target.value);
                setIsEndModified(true);
              }}
              fullWidth
              required
              disabled={isAllDay}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <MarkdownEditableBox
            label="Description"
            placeholder="Enter details"
            value={description}
            onChange={setDescription}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!title.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
