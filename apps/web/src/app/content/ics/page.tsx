'use client';

import { useState } from 'react';

import { useSnackbar } from 'notistack';
import { PageSection } from 'src/core/components/PageSection';
import { playInterfaceSound } from 'src/features/sound/utils/soundPlayer';
import { CalendarForm } from 'src/legacy/components/manager/CalendarForm';
import { CalendarList } from 'src/legacy/components/manager/CalendarList';
import { useSettingsStorage } from 'src/legacy/store/settings/store';
import { IcsCalendar } from 'src/legacy/types/icsCalendar';
import { ConfirmDialog } from 'src/shared/components/ConfirmDialog';

export default function CalendarManagerPage() {
  const calendars = useSettingsStorage(s => s.icsCalendars);
  const addCalendar = useSettingsStorage(s => s.addIcsCalendar);
  const updateCalendar = useSettingsStorage(s => s.updateIcsCalendar);
  const deleteCalendar = useSettingsStorage(s => s.deleteIcsCalendar);

  const { enqueueSnackbar } = useSnackbar();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const editingCalendar: IcsCalendar | undefined =
    editingIndex != null ? calendars[editingIndex] : undefined;

  function startEdit(idx: number) {
    setEditingIndex(idx);
  }

  function cancelEdit() {
    setEditingIndex(null);
    enqueueSnackbar('Edit canceled', { variant: 'info' });
    playInterfaceSound('reset');
  }

  function requestDelete(idx: number) {
    setPendingDeleteIndex(idx);
  }

  function closeDeleteDialog() {
    setPendingDeleteIndex(null);
    playInterfaceSound('reset');
  }

  function handleDeleteConfirmed() {
    if (pendingDeleteIndex == null) return;
    const cal = calendars[pendingDeleteIndex];
    deleteCalendar({ id: cal.id });

    if (editingIndex === pendingDeleteIndex) setEditingIndex(null);

    enqueueSnackbar(`Deleted "${cal.title}"`, { variant: 'success' });
    playInterfaceSound('trash');
    setPendingDeleteIndex(null);
  }

  function handleSubmit(payload: { title: string; source: string; color: string }) {
    const now = new Date();

    if (editingIndex != null) {
      const cal = calendars[editingIndex];
      updateCalendar({
        id: cal.id,
        title: payload.title,
        source: payload.source,
        color: payload.color,
        updatedAt: now,
      });
      enqueueSnackbar(`Updated "${payload.title}"`, { variant: 'success' });
      playInterfaceSound('done');
    } else {
      addCalendar({
        title: payload.title,
        source: payload.source,
        color: payload.color,
        updatedAt: now,
      });
      enqueueSnackbar(`Added "${payload.title}"`, { variant: 'success' });
      playInterfaceSound('increment');
    }

    setEditingIndex(null);
  }

  return (
    <PageSection title="Calendar Manager" description="Manage your ICS calendars">
      <CalendarList calendars={calendars} onEditAction={startEdit} onDeleteAction={requestDelete} />

      <CalendarForm
        key={editingCalendar?.id ?? 'new'}
        initial={editingCalendar}
        mode={editingCalendar ? 'edit' : 'add'}
        onSubmitAction={handleSubmit}
        onCancelAction={cancelEdit}
      />

      <ConfirmDialog
        open={pendingDeleteIndex != null}
        title="Delete calendar"
        content={
          pendingDeleteIndex != null
            ? `Are you sure you want to delete "${calendars[pendingDeleteIndex].title}"?`
            : ''
        }
        confirmButtonText="Delete"
        onCancel={closeDeleteDialog}
        onConfirm={handleDeleteConfirmed}
      />
    </PageSection>
  );
}
