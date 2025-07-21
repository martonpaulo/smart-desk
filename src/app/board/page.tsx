'use client';

import { useEffect, useState } from 'react';

import { Stack } from '@mui/material';

import { UndoSnackbar } from '@/components/UndoSnackbar';
import { useLocation } from '@/hooks/useLocation';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useWeather } from '@/hooks/useWeather';
import { useAudioStore } from '@/store/audioStore';
import { useEventStore } from '@/store/eventStore';
import { ChangeSnackbar } from '@/widgets/ChangeSnackbar';
import { Clock } from '@/widgets/Clock';
import { EventAlert } from '@/widgets/EventAlert';
import { EventList } from '@/widgets/EventList';
import { EventTimeline } from '@/widgets/EventTimeline';
import { HiddenColumnsList } from '@/widgets/HiddenColumnsList';
import { TodoList } from '@/widgets/TodoList';
import { TodoProgress } from '@/widgets/TodoProgress';

export default function BoardPage() {
  const { latitude, longitude } = useLocation();
  const { data: weather } = useWeather(latitude, longitude);
  const events = useEventStore(state => state.events);

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
