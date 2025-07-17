import { useEffect, useState } from 'react';

import { Stack } from '@mui/material';

import { UndoSnackbar } from '@/components/UndoSnackbar';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';
import { DashboardViewState } from '@/types/DashboardViewState';
import { IWeather } from '@/types/IWeather';
import { AuthControl } from '@/widgets/AuthControl';
import { ChangeSnackbar } from '@/widgets/ChangeSnackbar';
import { Clock } from '@/widgets/Clock';
import { EventAlert } from '@/widgets/EventAlert';
import { EventList } from '@/widgets/EventList';
import { EventTimeline } from '@/widgets/EventTimeline';
import { ICSCalendarManager } from '@/widgets/ICSCalendarManager';
import { LocalEventsManager } from '@/widgets/LocalEventsManager';
import { SettingsButton, SettingsDialog } from '@/widgets/Settings';
import { EventsTrash } from '@/widgets/Settings/EventsTrash';
import { GeneralSettings } from '@/widgets/Settings/GeneralSettings';
import { TagPresets } from '@/widgets/Settings/TagPresets';
import { SoundAlert } from '@/widgets/SoundAlert';
import { TodoList } from '@/widgets/TodoList';
import { TodoProgress } from '@/widgets/TodoProgress';

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
  const { isMobile } = useResponsiveness();
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

  // tick every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const setView = useTodoPrefsStore(state => state.setView);
  useEffect(() => {
    if (isMobile) setView('list');
  }, [isMobile, setView]);

  return (
    <Stack gap={2} p={isMobile ? 4 : 2}>
      <SettingsButton onClick={() => setSettingsOpen(true)} />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tabs={{
          General: <GeneralSettings />,
          'ICS Calendar': <ICSCalendarManager />,
          'Local Events': <LocalEventsManager />,
          'Deleted Events': <EventsTrash />,
          Tags: <TagPresets />,
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
        <TodoList />

        <Stack alignItems="flex-start">
          <Stack spacing={2}>
            <TodoProgress alignSelf="flex-end" />
            <EventList events={events} key={`${now.toISOString()}-EventList`} />
          </Stack>
        </Stack>
      </Stack>

      <EventAlert
        events={null}
        onAlertAcknowledge={onAlertAcknowledge}
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
