'use client';

import { useEffect, useState } from 'react';

import { Stack } from '@mui/material';
import dynamic from 'next/dynamic';

import { EventAlert } from '@/components/alert/EventAlert';
import { Clock } from '@/components/Clock';
import { TodoList } from '@/components/column/TodoList';
import { ChangeSnackbar } from '@/components/event/ChangeSnackbar';

// Lazily load heavy components to speed up initial render
const EventTimeline = dynamic(
  () => import('@/components/timeline/EventTimeline').then(m => m.EventTimeline),
  { ssr: false },
);
const EventList = dynamic(() => import('@/components/event/EventList').then(m => m.EventList), {
  ssr: false,
});
import { HiddenColumnsList } from '@/components/HiddenColumnsList';
import { TodoProgress } from '@/components/Progress';
import { UndoSnackbar } from '@/components/UndoSnackbar';
import { useEvents } from '@/hooks/useEvents';
import { useLocation } from '@/hooks/useLocation';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useWeather } from '@/hooks/useWeather';
import { useAudioStore } from '@/store/audioStore';
import { useEventStore } from '@/store/eventStore';

export default function BoardPage() {
  const { latitude, longitude } = useLocation();
  const { data: weather } = useWeather(latitude, longitude);
  const events = useEventStore(state => state.events);
  // Fetch events when visiting the board so data is available without opening the account page
  useEvents();

  const setAlertAcknowledged = useEventStore(state => state.setAlertAcknowledged);
  const isMeetingAlertEnabled = useAudioStore(state => state.meetingAlertEnabled);
  const isEventChangesAlertEnabled = useAudioStore(state => state.eventChangesAlertEnabled);

  const [now, setNow] = useState(new Date());
  const { isMobile } = useResponsiveness();

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
            <TodoProgress alignSelf="flex-end" />
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
