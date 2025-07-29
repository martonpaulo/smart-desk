import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import { DateTime } from 'luxon';

import { useLocalEventsStore } from '@/features/event/store/LocalEventsStore';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewEventModal({ isOpen, onClose }: NewEventModalProps) {
  // store actions
  const addLocalEvent = useLocalEventsStore(s => s.add);

  // form state
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [startIso, setStartIso] = useState('');
  const [endIso, setEndIso] = useState('');
  const [isEndModified, setIsEndModified] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [manualAllDay, setManualAllDay] = useState(false);

  // reset form on open
  useEffect(() => {
    if (!isOpen) return;
    const now = DateTime.now().startOf('minute');
    const defaultStart = now.toISO({ suppressMilliseconds: true })!;
    const defaultEnd = now.plus({ hours: 1 }).toISO({ suppressMilliseconds: true })!;
    setTitle('');
    setDetails('');
    setStartIso(defaultStart);
    setEndIso(defaultEnd);
    setIsEndModified(false);
    setIsAllDay(false);
    setManualAllDay(false);
  }, [isOpen]);

  // auto-sync end time to start +1h, unless user modified it
  useEffect(() => {
    if (isEndModified) return;
    const startDt = DateTime.fromISO(startIso);
    setEndIso(startDt.plus({ hours: 1 }).toISO({ suppressMilliseconds: true })!);
  }, [startIso, isEndModified]);

  // auto-toggle all-day status based on duration, unless manually changed
  useEffect(() => {
    if (manualAllDay) return;
    const startDt = DateTime.fromISO(startIso);
    const endDt = DateTime.fromISO(endIso);
    const hours = endDt.diff(startDt, 'hours').hours;
    setIsAllDay(hours >= 24);
  }, [startIso, endIso, manualAllDay]);

  // submit handler defined before useModalInputActions to avoid TS2448 error
  const submit = useCallback(async () => {
    if (!title.trim() || !startIso) return;

    const startTime = new Date(startIso);
    let endTime = endIso ? new Date(endIso) : new Date(startTime.getTime() + 60 * 60 * 1000);

    // ensure end > start
    if (endTime <= startTime) {
      endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    }

    // add to local store
    await addLocalEvent({
      startTime: isAllDay ? new Date(startTime.setHours(0, 0, 0, 0)) : startTime,
      endTime: isAllDay ? new Date(endTime.setHours(23, 59, 59, 999)) : endTime,
      description: details.trim() || undefined,
      allDay: isAllDay,
      createdAt: new Date(),
    });

    onClose();
  }, [title, details, startIso, endIso, isAllDay, addLocalEvent, onClose]);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="mobileLg">
      <DialogTitle>Create New Event</DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Start"
            type="datetime-local"
            value={startIso}
            onChange={e => setStartIso(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            disabled={isAllDay}
            required
          />
          <TextField
            label="End"
            type="datetime-local"
            value={endIso}
            onChange={e => {
              setEndIso(e.target.value);
              setIsEndModified(true);
            }}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            disabled={isAllDay}
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
            label="All day"
          />
          <MarkdownEditableBox
            label="Description"
            placeholder="Enter details"
            value={details}
            onChange={setDetails}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={!title.trim()}>
          Add Event
        </Button>
      </DialogActions>
    </Dialog>
  );
}
