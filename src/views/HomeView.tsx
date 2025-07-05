import { useEffect, useState } from 'react';

import { Stack } from '@mui/material';

import { DashboardViewState } from '@/types/DashboardViewState';
import { IWeather } from '@/types/IWeather';
import { AuthControl } from '@/widgets/AuthControl';
import { ChangeSnackbar } from '@/widgets/ChangeSnackbar';
import { Clock } from '@/widgets/Clock';
import { EventAlert } from '@/widgets/EventAlert';
import { EventList } from '@/widgets/EventList';
import { EventTimeline } from '@/widgets/EventTimeline';
import ICSCalendarManager from '@/widgets/ICSCalendarManager';
import { SettingsButton, SettingsDialog } from '@/widgets/Settings';
import { SoundAlert } from '@/widgets/SoundAlert';
import { TodoList } from '@/widgets/TodoList';

interface HomeViewProps {
  dashboardViewState: DashboardViewState;
  onAlertAcknowledge: (id: string) => void;
  audioEnabled: boolean;
  toggleAudioEnabled: () => void;
  isFirstRender: boolean;
  isMeetingAlertEnabled: boolean;
  onMeetingAlertToggle: () => void;
  isEventChangesAlertEnabled: boolean;
  onEventChangesAlertToggle: () => void;
  locationName?: string | null;
  weather?: IWeather | null;
  weatherIsLoading: boolean;
  weatherIsError: boolean;
  weatherError: Error | null;
}

export function HomeView({
  dashboardViewState,
  onAlertAcknowledge,
  audioEnabled,
  toggleAudioEnabled,
  isFirstRender,
  isMeetingAlertEnabled,
  onMeetingAlertToggle,
  isEventChangesAlertEnabled,
  onEventChangesAlertToggle,
  weather,
}: HomeViewProps) {
  const [now, setNow] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    severity,
    message,
    isLoading,
    canSignIn,
    canSignOut,
    events,
    handleSignIn,
    handleSignOut,
  } = dashboardViewState;

  // tick every second (or adjust to 15s/30s if you like)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Stack p={2} gap={2}>
      <SettingsButton onClick={() => setSettingsOpen(true)} />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tabs={{
          'ICS Calendar': <ICSCalendarManager />,
          Auth: (
            <AuthControl
              severity={severity}
              message={message}
              isLoading={isLoading}
              canSignIn={canSignIn}
              canSignOut={canSignOut}
              handleSignIn={handleSignIn}
              handleSignOut={handleSignOut}
            />
          ),
          'Sound Alerts': events && (
            <SoundAlert
              currentTime={now}
              events={events}
              onAudioToggle={toggleAudioEnabled}
              isAudioOn={audioEnabled}
              isFirstRender={isFirstRender}
              isMeetingStartingAlertEnabled={isMeetingAlertEnabled}
              onMeetingStartingAlertToggle={onMeetingAlertToggle}
              isEventChangesAlertEnabled={isEventChangesAlertEnabled}
              onEventChangesAlertToggle={onEventChangesAlertToggle}
            />
          ),
        }}
      />
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

      <Stack spacing={2} direction="row">
        <TodoList events={events ?? null} />
        <EventList events={events} />
      </Stack>

      <EventAlert
        events={events}
        onAlertAcknowledge={onAlertAcknowledge}
        alertLeadTimeMinutes={3}
        meetingAlertEnabled={isMeetingAlertEnabled}
      />

      {events && (
        <ChangeSnackbar events={events} eventChangesAlertEnabled={isEventChangesAlertEnabled} />
      )}
    </Stack>
  );
}
