'use client';

import { useState } from 'react';

import { Box, Typography } from '@mui/material';

import { useSettingsStorage } from '@/store/settings/store';
import { CalendarForm } from '@/widgets/ICSCalendarManager/CalendarForm';
import { CalendarList } from '@/widgets/ICSCalendarManager/CalendarList';

export default function CalendarManager() {
  const calendars = useSettingsStorage(state => state.icsCalendars);
  const addCalendar = useSettingsStorage(state => state.addIcsCalendar);
  const updateCalendar = useSettingsStorage(state => state.updateIcsCalendar);
  const deleteCalendar = useSettingsStorage(state => state.deleteIcsCalendar);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const startEdit = (idx: number) => setEditingIndex(idx);
  const cancelEdit = () => setEditingIndex(null);

  const handleDelete = (idx: number) => {
    const title = calendars[idx].title;
    if (!window.confirm(`Delete calendar "${title}"?`)) return;
    deleteCalendar({ id: calendars[idx].id });
    if (editingIndex === idx) cancelEdit();
  };

  const handleSubmit = (title: string, source: string, color: string) => {
    const now = new Date();

    if (editingIndex != null) {
      if (!window.confirm('Update this calendar configuration?')) return;
      updateCalendar({
        id: calendars[editingIndex].id,
        title,
        source,
        color,
        updatedAt: now,
      });
    } else {
      addCalendar({
        title,
        source,
        color,
        updatedAt: now,
      });
    }
    cancelEdit();
  };

  return (
    <Box p={2} m={2} sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom>
        ICS Calendars
      </Typography>
      <CalendarList calendars={calendars} onEdit={startEdit} onDelete={handleDelete} />
      <CalendarForm
        initial={editingIndex != null ? calendars[editingIndex] : undefined}
        mode={editingIndex != null ? 'edit' : 'add'}
        onSubmit={handleSubmit}
        onCancel={cancelEdit}
      />
    </Box>
  );
}
