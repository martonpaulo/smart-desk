import { useEffect, useState } from 'react';

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
import { Event } from '@/features/event/types/Event';
import { useEventStore } from '@/legacy/store/eventStore';
import { mapToLegacyEvent } from '@/legacy/utils/eventLegacyMapper';
import { MarkdownEditableBox } from '@/shared/components/MarkdownEditableBox';
import { useModalInputActions } from '@/shared/hooks/useModalInputActions';

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewEventModal({ open, onClose }: NewEventModalProps) {
  const add = useLocalEventsStore(s => s.add);
  const addLegacy = useEventStore(s => s.addLocalEvent);

  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [endChanged, setEndChanged] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [manualAllDay, setManualAllDay] = useState(false);

  // initialize form each time modal opens
  useEffect(() => {
    if (!open) return;
    const now = DateTime.now().startOf('minute');
    const startIso = now.toISO({ suppressMilliseconds: true }) ?? '';
    const endIso = now.plus({ hours: 1 }).toISO({ suppressMilliseconds: true }) ?? '';
    setSummary('');
    setDescription('');
    setStart(startIso);
    setEnd(endIso);
    setEndChanged(false);
    setAllDay(false);
    setManualAllDay(false);
  }, [open]);

  // update end time when start changes if user hasn't modified it
  useEffect(() => {
    if (!endChanged) {
      const startDt = DateTime.fromISO(start);
      setEnd(startDt.plus({ hours: 1 }).toISO({ suppressMilliseconds: true }) ?? '');
    }
  }, [start, endChanged]);

  // auto update allDay unless manually toggled
  useEffect(() => {
    if (manualAllDay) return;
    const startDt = DateTime.fromISO(start);
    const endDt = DateTime.fromISO(end);
    const hours = endDt.diff(startDt, 'hours').hours;
    setAllDay(hours >= 24);
  }, [start, end, manualAllDay]);

  const handleSubmit = async () => {
    if (!summary.trim() || !start) return;

    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date(startTime.getTime() + 60 * 60 * 1000);
    const createdAt = new Date();

    const id = await add({
      startTime,
      endTime,
      summary: summary.trim(),
      description: description.trim() || undefined,
      allDay,
      acknowledged: false,
      createdAt,
    });

    const event: Event = {
      id,
      startTime,
      endTime,
      summary: summary.trim(),
      description: description.trim() || undefined,
      allDay,
      acknowledged: false,
      trashed: false,
      createdAt,
      updatedAt: createdAt,
      isSynced: false,
    };

    addLegacy(mapToLegacyEvent(event));
    onClose();
  };

  const { handleKeyDown, handleBlur } = useModalInputActions({
    onSave: handleSubmit,
    onClose,
    mapping: { enter: 'none' },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="mobileLg">
      <DialogTitle>New Event</DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            label="Summary"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            fullWidth
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            required
          />
          <TextField
            label="Start Time"
            type="datetime-local"
            value={start}
            onChange={e => setStart(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            required
          />
          <TextField
            label="End Time"
            type="datetime-local"
            value={end}
            onChange={e => {
              setEnd(e.target.value);
              setEndChanged(true);
            }}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={allDay}
                onChange={(_, checked) => {
                  setAllDay(checked);
                  setManualAllDay(true);
                }}
              />
            }
            label="All day"
          />
          <MarkdownEditableBox
            label="Description"
            placeholder="Enter a description"
            value={description}
            onChange={setDescription}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Event
        </Button>
      </DialogActions>
    </Dialog>
  );
}

