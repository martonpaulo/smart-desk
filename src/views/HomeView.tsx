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
import { SoundAlert } from '@/widgets/SoundAlert';
import { Weather } from '@/widgets/Weather';

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
  locationName,
  weather,
  weatherIsLoading,
  weatherIsError,
  weatherError,
}: HomeViewProps) {
  const [now, setNow] = useState(new Date());
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
    <Stack p={2} spacing={6}>
      <EventTimeline events={events} currentTime={now} pastWindowHours={3} futureWindowHours={6} />

      <Stack direction="row" justifyContent="space-around">
        <EventList events={events} />

        <Stack spacing={6} alignItems="center">
          <Stack direction="row" spacing={6} alignItems="center">
            <Clock currentTime={now} />

            <Weather
              locationName={locationName}
              weather={weather}
              weatherIsLoading={weatherIsLoading}
              weatherIsError={weatherIsError}
              weatherError={weatherError}
            />
          </Stack>

          {events && (
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
          )}

          <AuthControl
            severity={severity}
            message={message}
            isLoading={isLoading}
            canSignIn={canSignIn}
            canSignOut={canSignOut}
            handleSignIn={handleSignIn}
            handleSignOut={handleSignOut}
          />
        </Stack>
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
