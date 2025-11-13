import { Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocalEventsStore } from 'src/features/event/store/useLocalEventsStore';
import { Event } from 'src/features/event/types/Event';
import { CustomDialog } from 'src/shared/components/CustomDialog';
import { MarkdownEditableBox } from 'src/shared/components/MarkdownEditableBox';

// helper to build a JS Date from separate date and time strings
function combineDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

// form values shape for comparison
type FormValues = {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
};

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  event?: Event;
}

export function EventModal({ open, onClose, event }: EventModalProps) {
  // ref to store initial form values on open
  const initialValuesRef = useRef<FormValues>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false,
  });

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [manualAllDay, setManualAllDay] = useState(false);
  const [isEndModified, setIsEndModified] = useState(false);

  // reset form when opening or event changes and record initial values
  useEffect(() => {
    if (!open) return;

    let init: FormValues;

    if (event) {
      const s = DateTime.fromJSDate(new Date(event.startTime));
      const e = DateTime.fromJSDate(new Date(event.endTime));

      init = {
        title: event.summary,
        description: event.description || '',
        startDate: s.toISODate() || '',
        startTime: s.toFormat('HH:mm'),
        endDate: e.toISODate() || '',
        endTime: e.toFormat('HH:mm'),
        isAllDay: event.allDay,
      };

      setTitle(init.title);
      setDescription(init.description);
      setStartDate(init.startDate);
      setStartTime(init.startTime);
      setEndDate(init.endDate);
      setEndTime(init.endTime);
      setIsAllDay(init.isAllDay);
      setManualAllDay(true);
      setIsEndModified(true);
    } else {
      const now = DateTime.now();
      const d = now.toISODate() || '';
      const round = now.plus({ minutes: 60 - now.minute }).startOf('minute');
      const t = round.toFormat('HH:mm');
      const next = round.plus({ hours: 1 });

      init = {
        title: '',
        description: '',
        startDate: d,
        startTime: t,
        endDate: d,
        endTime: next.toFormat('HH:mm'),
        isAllDay: false,
      };

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

    initialValuesRef.current = init;
  }, [open, event]);

  // compute dirty state by comparing current values to initial
  const isDirty = useMemo(() => {
    const current: FormValues = {
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      isAllDay,
    };
    return JSON.stringify(current) !== JSON.stringify(initialValuesRef.current);
  }, [title, description, startDate, startTime, endDate, endTime, isAllDay]);

  // keep end = start +1h unless touched
  useEffect(() => {
    if (isEndModified) return;
    if (!startDate || !startTime) return;
    const s = DateTime.fromISO(`${startDate}T${startTime}`);
    const e = s.plus({ hours: 1 });
    setEndDate(e.toISODate() || '');
    setEndTime(e.toFormat('HH:mm'));
  }, [startDate, startTime, isEndModified]);

  // auto toggle all-day for spans ≥24h
  useEffect(() => {
    if (manualAllDay) return;
    if (!startDate || !startTime || !endDate || !endTime) return;
    const s = DateTime.fromISO(`${startDate}T${startTime}`);
    const e = DateTime.fromISO(`${endDate}T${endTime}`);
    setIsAllDay(e.diff(s, 'hours').hours >= 24);
  }, [startDate, startTime, endDate, endTime, manualAllDay]);

  // store actions
  const addLocalEvent = useLocalEventsStore(s => s.add);
  const updateEvent = useLocalEventsStore(s => s.update);
  const deleteEvent = useLocalEventsStore(s => s.softDelete);
  const restoreEvent = useLocalEventsStore(s => s.restore);

  // save handler
  const handleSave = useCallback(async () => {
    const s = combineDateTime(startDate, startTime);
    let e =
      endDate && endTime ? combineDateTime(endDate, endTime) : new Date(s.getTime() + 3600_000);
    if (e <= s) e = new Date(s.getTime() + 3600_000);
    if (isAllDay) {
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
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
  ]);

  const isValid = title.trim() !== '' && startDate !== '' && endDate !== '';

  return (
    <CustomDialog
      item="event"
      open={open}
      mode={event ? 'edit' : 'new'}
      isDirty={isDirty}
      isValid={isValid}
      onClose={onClose}
      onSave={handleSave}
      deleteAction={deleteEvent}
      restoreAction={restoreEvent}
      deleteId={event?.id}
      title={title}
      onTitleChange={value => setTitle(value)}
      titlePlaceholder="What are you going to do?"
      titleLimit={64}
    >
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
    </CustomDialog>
  );
}
