'use client';

import { useEffect, useState } from 'react';

import { Stack } from '@mui/material';
import dynamic from 'next/dynamic';

// Lazily load heavy components to speed up initial render
const EventTimeline = dynamic(
  () => import('@/legacy/components/timeline/EventTimeline').then(m => m.EventTimeline),
  { ssr: false },
);
const EventList = dynamic(
  () => import('@/legacy/components/event/EventList').then(m => m.EventList),
  {
    ssr: false,
  },
);
import { EventAlert } from '@/legacy/components/alert/EventAlert';
import { Clock } from '@/legacy/components/Clock';
import { TodoList } from '@/legacy/components/column/TodoList';
import { DailyTimeLoadIndicator } from '@/legacy/components/DailyTimeLoadIndicator';
import { ChangeSnackbar } from '@/legacy/components/event/ChangeSnackbar';
import { HiddenColumnsList } from '@/legacy/components/HiddenColumnsList';
import { TodoProgress } from '@/legacy/components/Progress';
import { UndoSnackbar } from '@/legacy/components/UndoSnackbar';
import { useEvents } from '@/legacy/hooks/useEvents';
import { useLocation } from '@/legacy/hooks/useLocation';
import { useProcessEventsColumn } from '@/legacy/hooks/useProcessEventsColumn';
import { useWeather } from '@/legacy/hooks/useWeather';
import { useAudioStore } from '@/legacy/store/audioStore';
import { useEventStore } from '@/legacy/store/eventStore';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

export default function BoardPage() {
  const { latitude, longitude } = useLocation();
  const { data: weather } = useWeather(latitude, longitude);
  const events = useEventStore(state => state.events);
  // Fetch events when visiting the board so data is available without opening the account page
  useEvents();

  // create tasks from all-day events once per day
  useProcessEventsColumn();

  const setAlertAcknowledged = useEventStore(state => state.setAlertAcknowledged);
  const isMeetingAlertEnabled = useAudioStore(state => state.meetingAlertEnabled);
  const isEventChangesAlertEnabled = useAudioStore(state => state.eventChangesAlertEnabled);

  const [now, setNow] = useState(new Date());
  const isMobile = useResponsiveness();

  // tick every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Stack gap={2}>
      {!isMobile && (
        <Stack direction="row" justifyContent="space-between" gap={2} alignItems="center">
          <Stack flexGrow={1}>
            <EventTimeline
              events={events}
              currentTime={now}
              pastWindowHours={3}
              futureWindowHours={6}
            />
          </Stack>

          {weather && <Clock currentTime={now} weather={weather} />}
        </Stack>
      )}

      <Stack
        spacing={2}
        direction={isMobile ? 'column-reverse' : 'row'}
        alignItems={isMobile ? 'stretch' : 'flex-start'}
      >
        <TodoList showDate={false} />

        <Stack alignItems="flex-start">
          <Stack spacing={2}>
            <Stack direction="row" gap={1} justifyContent="space-between" alignItems="center">
              <DailyTimeLoadIndicator />
              <TodoProgress />
            </Stack>
            <EventList events={events} key={`${now.toISOString()}-EventList`} />
            <HiddenColumnsList />
          </Stack>
        </Stack>
      </Stack>

      <EventAlert
        events={null}
        onAlertAcknowledge={setAlertAcknowledged}
        alertLeadTimeMinutes={2}
        meetingAlertEnabled={isMeetingAlertEnabled}
        key={`${now.toISOString()}-EventAlert`}
      />

      {events && (
        <ChangeSnackbar
          events={events}
          eventChangesAlertEnabled={isEventChangesAlertEnabled}
          key={`${now.toISOString()}-ChangeSnackbar`}
        />
      )}
      <UndoSnackbar />
    </Stack>
  );
}
